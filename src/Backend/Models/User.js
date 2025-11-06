// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const UserSchema = new mongoose.Schema(
  {
    user_id: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email format"]
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

// 🔒 Hash password otomatis sebelum disimpan
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 🧮 Auto increment user_id setiap kali buat user baru
UserSchema.plugin(AutoIncrement, { inc_field: "user_id" });

// Hapus password dari output JSON
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
