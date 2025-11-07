import mongoose from "mongoose";

const MallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Mall = mongoose.models.Mall || mongoose.model("Mall", MallSchema);