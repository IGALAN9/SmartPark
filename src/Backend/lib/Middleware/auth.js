import { User } from "../../Models/User.js";

// Middleware untuk memeriksa apakah pengguna adalah admin
export const isAdmin = async (req, res, next) => {
  try {
    const uid = req.cookies?.uid; //
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(uid);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (user.role !== "admin") { //
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    // Jika dia admin, lampirkan data user ke request
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Middleware untuk memeriksa apakah pengguna sudah login (user biasa atau admin)
export const isLoggedIn = async (req, res, next) => {
  try {
    const uid = req.cookies?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(uid);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};