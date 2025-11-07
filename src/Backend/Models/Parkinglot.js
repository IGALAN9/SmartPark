import mongoose from "mongoose";

const ParkingLotSchema = new mongoose.Schema(
  {
    mall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true,
    },
    // Misal: "Floor 1", "P1", "Basement 2"
    floor_level: { type: String, required: true },
  },
  { 
    timestamps: true,
    indexes: [
      { fields: { mall: 1, floor_level: 1 }, unique: true }
    ]
  }
);

export const ParkingLot = mongoose.models.ParkingLot || mongoose.model("ParkingLot", ParkingLotSchema);