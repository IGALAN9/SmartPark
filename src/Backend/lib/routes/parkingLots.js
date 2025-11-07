import express from "express";
import { ParkingLot } from "../../Models/parkinglot.js";
import { Mall } from "../../Models/Mall.js";
import { isAdmin } from "../Middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// POST /api/parking-lots (Hanya Admin)
// Membuat "lantai" baru di dalam mall
router.post("/", isAdmin, async (req, res) => {
  try {
    const { mallId, floorLevel } = req.body;
    if (!mallId || !floorLevel) {
      return res.status(400).json({ error: "mallId and floorLevel are required" });
    }
    const mall = await Mall.findOne({ _id: mallId, admin: req.user._id });
    if (!mall) {
      return res.status(404).json({ error: "Mall not found or you are not the owner" });
    }

    const newLot = await ParkingLot.create({
      mall: mallId,
      floor_level: floorLevel
    });

    res.status(201).json(newLot);
  } catch (e) {
    if (e.code === 11000) { 
      return res.status(409).json({ error: "This floor level already exists in this mall" });
    }
    res.status(400).json({ error: e.message });
  }
});

// ----------------------------------------------------
// KODE BARU: DELETE /api/parking-lots/:id
// Menghapus Lot (Lantai) DAN semua Slot di dalamnya
// ----------------------------------------------------
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params; 
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Lot ID" });
    }

    const lotToDelete = await ParkingLot.findById(id);
    if (!lotToDelete) {
      return res.status(404).json({ error: "Parking lot not found" });
    }

    const parentMall = await Mall.findOne({ 
      _id: lotToDelete.mall, 
      admin: req.user._id 
    });
    if (!parentMall) {
      return res.status(403).json({ error: "Forbidden: You do not own this mall" });
    }

    await ParkingSlot.deleteMany({ lot: id });

    await ParkingLot.findByIdAndDelete(id);

    res.json({ ok: true, message: "Lot and all associated slots deleted" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete lot" });
  }
});


export default router;