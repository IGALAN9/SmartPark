import express from "express";
import { Mall } from "../../Models/Mall.js";
import { ParkingLot } from "../../Models/parkinglot.js";
import { ParkingSlot } from "../../Models/parkingslot.js";
import { isAdmin } from "../Middleware/auth.js";

const router = express.Router();

// GET /api/malls (Untuk Admin)
// Mengambil semua data mall, lantai, dan slot
router.get("/", isAdmin, async (req, res) => {
  try {
    // 1. Ambil semua mall yang dimiliki admin ini
    const malls = await Mall.find({ admin: req.user._id }).sort({ name: 1 }).lean();

    // 2. Untuk setiap mall, ambil data lot (lantai)
    const data = await Promise.all(malls.map(async (mall) => {
      const lots = await ParkingLot.find({ mall: mall._id }).lean();
      
      // 3. Untuk setiap lot, hitung slot
      const floors = await Promise.all(lots.map(async (lot) => {
        const [total, available] = await Promise.all([
          ParkingSlot.countDocuments({ lot: lot._id }),
          ParkingSlot.countDocuments({ lot: lot._id, status: "Available" })
        ]);
        return { 
          id: lot._id, 
          name: lot.floor_level, 
          available, 
          total 
        };
      }));
      
      return {
        id: mall._id,
        name: mall.name,
        address: mall.address,
        floors: floors
      };
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch malls" });
  }
});

// POST /api/malls (Hanya Admin)
// Membuat Mall baru
router.post("/", isAdmin, async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    const newMall = await Mall.create({
      name,
      address,
      admin: req.user._id // Ambil ID admin dari middleware
    });

    res.status(201).json(newMall);
  } catch (e) {
    if (e.code === 11000) { // Error duplikat
      return res.status(409).json({ error: "Mall name already exists" });
    }
    res.status(400).json({ error: e.message });
  }
});

export default router;