import mongoose from "mongoose";

const ParkingSlotSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      required: true,
    },
    slot_code: { type: String, required: true }, 
    status: {
      type: String,
      enum: ["Available", "Booked", "Occupied"], 
      default: "Available",
    },
    booked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
  },
  { 
    timestamps: true, 
    indexes: [
      { fields: { lot: 1, slot_code: 1 }, unique: true } 
    ]
  }
);

export const ParkingSlot = mongoose.models.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema);