import express from "express";
import mongoose from "mongoose";
import { ParkingSlot } from "../../Models/parkingslot.js";
import { ParkingLot } from "../../Models/parkinglot.js";
import { Mall } from "../../Models/Mall.js";
import { isAdmin, isLoggedIn } from "../Middleware/auth.js";

const router = express.Router();

// Middleware untuk cek kepemilikan lot (lantai)
const isLotOwner = async (req, res, next) => {
  try {
    const lotId = req.query.lotId || req.body.lotId;
    if (!lotId) return res.status(400).json({ error: "Lot ID required" });

    const lot = await ParkingLot.findById(lotId);
    if (!lot) return res.status(404).json({ error: "Parking lot not found" });

    const mall = await Mall.findOne({ _id: lot.mall, admin: req.user._id });
    if (!mall) return res.status(403).json({ error: "Forbidden: Not owner" });
    
    req.lot = lot;
    next();
  } catch {
    res.status(500).json({ error: "Middleware error" });
  }
};

// Mendapatkan semua slot untuk 1 lantai (lot)
router.get("/", isAdmin, isLotOwner, async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ lot: req.lot._id }).sort({ slot_code: 1 });
    res.json(slots);
  } catch {
    res.status(500).json({ error: "Failed to get slots" });
  }
});

// Mendapatkan semua slot untuk user (memerlukan login)
router.get("/public", isLoggedIn, async (req, res) => {
  try {
    const { lotId } = req.query;
    if (!lotId) return res.status(400).json({ error: "Lot ID required" });

    const lot = await ParkingLot.findById(lotId);
    if (!lot) return res.status(404).json({ error: "Parking lot not found" });

    const slots = await ParkingSlot.find({ lot: lot._id }).sort({ slot_code: 1 }).lean();
    
    const slotsWithMyStatus = slots.map(slot => ({
      ...slot,
      isBookedByMe: slot.booked_by ? slot.booked_by.equals(req.user._id) : false
    }));

    res.json(slotsWithMyStatus);
  } catch {
    res.status(500).json({ error: "Failed to get slots" });
  }
});

// Menambahkan slot baru ke lantai (tombol "+")
router.post("/", isAdmin, isLotOwner, async (req, res) => {
  try {
    const lastSlot = await ParkingSlot.findOne({ lot: req.lot._id })
      .sort({ createdAt: -1 }); 

    const lastNum = lastSlot ? parseInt(lastSlot.slot_code.match(/\d+/g)?.pop() || '0', 10) : 0;
    
    const newSlotCode = String(lastNum + 1).padStart(2, '0');

    const newSlot = await ParkingSlot.create({
      lot: req.lot._id,
      slot_code: newSlotCode,
      status: "Available",
    });
    res.status(201).json(newSlot);
  } catch {
    res.status(500).json({ error: "Failed to create slot" });
  }
});

// User melakukan booking
router.patch("/:id/book", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await ParkingSlot.findById(id);

    if (!slot) return res.status(404).json({ error: "Slot not found" });
    if (slot.status !== "Available") {
      return res.status(409).json({ error: "Slot is not available" });
    }

    // Cek apakah user ini (req.user._id) sudah punya booking lain
    const existingBooking = await ParkingSlot.findOne({ booked_by: req.user._id });
    if (existingBooking) {
      return res.status(409).json({ error: "You can only book one slot at a time." });
    }

    slot.status = "Booked"; 
    slot.booked_by = req.user._id;
    await slot.save();

    res.json(slot);
  } catch{
    res.status(500).json({ error: "Booking failed" });
  }
});

// Menghapus 1 slot
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const deleted = await ParkingSlot.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Slot not found" });
    
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete slot" });
  }
});


// Mengubah status slot (dari modal admin)
router.patch("/:id/status", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    
    if (!["Available", "Booked", "Occupied"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updated = await ParkingSlot.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Slot not found" });
    
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// User membatalkan booking
router.patch("/:id/unbook", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await ParkingSlot.findById(id);

    if (!slot) return res.status(404).json({ error: "Slot not found" });

    // User hanya bisa unbook slot yg mereka book sendiri
    if (!slot.booked_by || !slot.booked_by.equals(req.user._id)) {
      return res.status(403).json({ error: "You cannot unbook this slot" });
    }
    
    // Admin mungkin mengubah status jadi "Occupied". User tidak bisa unbook.
    if (slot.status !== "Booked") {
        return res.status(409).json({ error: "Cannot unbook an occupied slot" });
    }

    slot.status = "Available";
    slot.booked_by = null;
    await slot.save();

    res.json(slot);
  } catch {
    res.status(500).json({ error: "Unbooking failed" });
  }
});

export default router;