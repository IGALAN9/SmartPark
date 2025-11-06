import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { User } from "../Models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // 1. hapus dulu data lama
    await User.deleteMany({});
    console.log("Semua data lama dihapus.");

    // 2. buat data dummy
    const users = [
    { name: "Admin Utama", email: "admin@example.com", password: "admin123", role: "admin" },
    { name: "Galang Pratama", email: "galang@example.com", password: "galang123", role: "user" },
    { name: "Ayu Rahma", email: "ayu@example.com", password: "ayu123", role: "user" }
    ];

    // 3. insert ke DB
    await User.insertMany(users);
    console.log("Data user sudah ditambahkan.");

    process.exit(0);
  } catch (err) {
    console.error("Seeder gagal:", err);
    process.exit(1);
  }
};

seedUsers();
