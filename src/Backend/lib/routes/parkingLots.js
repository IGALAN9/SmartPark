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

    // Cek apakah admin ini pemilik mall-nya
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
    if (e.code === 11000) { // Error duplikat (dari index unik)
      return res.status(409).json({ error: "This floor level already exists in this mall" });
    }
    res.status(400).json({ error: e.message });
  }
});

// Anda bisa tambahkan endpoint lain di sini
// (Misal: POST /api/parking-slots untuk menambah slot ke lot)
// (Misal: GET /api/parking-lots/:mallId untuk lihat semua lot di 1 mall)

export default router;