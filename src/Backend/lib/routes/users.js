import express from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../../Models/User.js";

const router = express.Router();
const isNumeric = (v) => /^\d+$/.test(String(v));
const sanitizeRole = (r) => (r === "admin" ? "admin" : "user");
const isProd = process.env.NODE_ENV === "production";

function setUidCookie(res, userId) {
  res.cookie("uid", String(userId), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600 * 1000,
    path: "/",
  });
}


// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    setUidCookie(res, user._id); 
    const json = user.toJSON(); delete json.password;
    res.json({ ok: true, user: json });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/users/me
router.get("/me", async (req, res) => {
  try {
    const uid = req.cookies?.uid; 
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(uid);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    res.json({ ok: true, user: user.toJSON() });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// POST /api/users/logout
router.post("/logout", (req, res) => {
  res.clearCookie("uid", { path: "/" });
  res.json({ ok: true });
});


// GET /api/users?page=&limit=&q=
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "20", 10), 1), 100);
    const q = String(req.query.q ?? "").trim();

    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  } catch {
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /api/users/:id  (dukung user_id numeric atau _id Mongo)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNumeric(id)) {
      const user = await User.findOne({ user_id: Number(id) });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    }
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid user id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });
    if (!validator.isEmail(String(email))) return res.status(400).json({ error: "Invalid email" });
    if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 chars" });

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already exists" });

    const created = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password,                
      role: sanitizeRole(role),
    });

    setUidCookie(res, created._id);
    res.status(201).json({ ok: true, user: created.toJSON() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/users/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {};
    const { name, email, password, role } = req.body ?? {};

    if (name) payload.name = String(name).trim();
    if (email) {
      if (!validator.isEmail(String(email))) return res.status(400).json({ error: "Invalid email" });
      payload.email = String(email).toLowerCase().trim();
    }
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 chars" });
      payload.password = await bcrypt.hash(String(password), 10);
    }
    if (role) payload.role = sanitizeRole(role);

    const query = isNumeric(id) ? { user_id: Number(id) } : { _id: id };
    const updated = await User.findOneAndUpdate(query, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch {
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

    if (req.cookies?.uid && String(req.cookies.uid) === String(deleted._id)) {
      res.clearCookie("uid", { path: "/" });
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
