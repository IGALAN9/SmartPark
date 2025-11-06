// src/lib/routes/users.js
import express from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import { User } from "../../Models/User.js";

const router = express.Router();

// Helpers
const isNumeric = (v) => /^\d+$/.test(String(v));
const sanitizeRole = (r) => (r === "admin" ? "admin" : "user");

// GET /api/users?page=1&limit=20&q=galang
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "20", 10), 1), 100);
    const q = String(req.query.q ?? "").trim();

    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
      : {};

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ page, limit, total, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /api/users/:id  (supports numeric user_id or Mongo _id)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = isNumeric(id)
      ? await User.findOne({ user_id: Number(id) })
      : await User.findById(id);

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// POST /api/users  { name, email, password, role? }
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 chars" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already exists" });

    const created = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password, // will be hashed by pre('save')
      role: sanitizeRole(role)
    });

    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

// POST /api/users/login { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    // ambil password (field select:false di schema)
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // kirim user tanpa password
    const json = user.toJSON(); delete json.password;
    res.json({ ok: true, user: json });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

// PATCH /api/users/:id  (name/email/password/role)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {};
    const { name, email, password, role } = req.body ?? {};

    if (name) payload.name = String(name).trim();
    if (email) {
      if (!validator.isEmail(String(email))) {
        return res.status(400).json({ error: "Invalid email" });
      }
      payload.email = String(email).toLowerCase().trim();
    }
    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 chars" });
      }
      payload.password = await bcrypt.hash(String(password), 10);
    }
    if (role) payload.role = sanitizeRole(role);

    const query = isNumeric(id) ? { user_id: Number(id) } : { _id: id };
    const updated = await User.findOneAndUpdate(query, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Failed to update user" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = isNumeric(id) ? { user_id: Number(id) } : { _id: id };
    const deleted = await User.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
