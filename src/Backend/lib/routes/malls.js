import express from "express";
import { Mall } from "../../Models/Mall.js";
import { ParkingLot } from "../../Models/parkinglot.js";
import { ParkingSlot } from "../../Models/parkingslot.js";
import { isAdmin, isLoggedIn } from "../Middleware/auth.js";

import mongoose from "mongoose";

const router = express.Router();

// GET /api/malls (Untuk Admin)
// Mengambil semua data mall, lantai, dan slot
router.get("/", isAdmin, async (req, res) => {
  try {
    const malls = await Mall.find({ admin: req.user._id }).sort({ name: 1 }).lean();

    const data = await Promise.all(malls.map(async (mall) => {
      const lots = await ParkingLot.find({ mall: mall._id }).lean();
      
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
  } catch {
    res.status(500).json({ error: "Failed to fetch malls" });
  }
});

// ----------------------------------------------------
// BARU: PUBLIC GET /api/malls/public (Untuk User)
// ----------------------------------------------------
router.get("/public", isLoggedIn, async (req, res) => {
  try {
    // 1. Ambil SEMUA mall (tidak difilter by admin)
    const malls = await Mall.find({}).sort({ name: 1 }).lean();

    // 2. Logic sisanya SAMA dengan admin (meng-agregasi data)
    const data = await Promise.all(malls.map(async (mall) => {
      const lots = await ParkingLot.find({ mall: mall._id }).lean();
      
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
  } catch {
    res.status(500).json({ error: "Failed to fetch public malls" });
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
      admin: req.user._id 
    });

    res.status(201).json(newMall);
  } catch (e) {
    if (e.code === 11000) { 
      return res.status(409).json({ error: "Mall name already exists" });
    }
    res.status(400).json({ error: e.message });
  }
});

// ----------------------------------------------------
// KODE BARU: DELETE /api/malls/:id
// Menghapus Mall DAN semua Lot + Slot di dalamnya
// ----------------------------------------------------
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Mall ID" });
    }

    const mall = await Mall.findOne({ _id: id, admin: req.user._id });
    if (!mall) {
      return res.status(404).json({ error: "Mall not found or you are not the owner" });
    }

    const lots = await ParkingLot.find({ mall: id }).select("_id");
    const lotIds = lots.map(lot => lot._id);

    if (lotIds.length > 0) {
      await ParkingSlot.deleteMany({ lot: { $in: lotIds } });
    }

    if (lotIds.length > 0) {
      await ParkingLot.deleteMany({ mall: id });
    }

    await Mall.findByIdAndDelete(id);

    res.json({ ok: true, message: "Mall and all associated data deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete mall" });
  }
});

export default router;