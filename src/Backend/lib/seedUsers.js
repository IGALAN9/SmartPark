import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { User } from "../Models/User.js";
import { Mall } from "../Models/Mall.js";
import { ParkingLot } from "../Models/parkinglot.js";
import { ParkingSlot } from "../Models/parkingslot.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Hapus semua data lama
    await User.deleteMany({});
    await Mall.deleteMany({});
    await ParkingLot.deleteMany({});
    await ParkingSlot.deleteMany({});
    console.log("Semua data lama dihapus.");

    //Buat data User
    const users = await User.create([
      { name: "Admin Utama", email: "admin@example.com", password: "admin123", role: "admin" },
      { name: "Galang Pratama", email: "galang@example.com", password: "galang123", role: "user" },
      { name: "Ayu Rahma", email: "ayu@example.com", password: "ayu123", role: "user" }
    ]);
    console.log("Data user sudah ditambahkan.");

    // Ambil ID admin
    const adminUser = users.find(u => u.role === 'admin');

    // Buat data Mall
    const mall1 = await Mall.create({
      name: "MALL 1",
      address: "Jl. Raya SmartPark No. 1, Jakarta",
      admin: adminUser._id
    });
    console.log("Data Mall 1 ditambahkan.");

    // Buat data ParkingLot (Lantai) untuk Mall 1
    const floor1 = await ParkingLot.create({
      mall: mall1._id,
      floor_level: "Floor 1"
    });
    const floor2 = await ParkingLot.create({
      mall: mall1._id,
      floor_level: "Floor 2"
    });
    console.log("Data Lantai untuk Mall 1 ditambahkan.");

    //Buat data ParkingSlot untuk Floor 1
    const floor1Slots = [];
    for (let i = 1; i <= 27; i++) {
      floor1Slots.push({
        lot: floor1._id,
        slot_code: `A${String(i).padStart(2, '0')}`,
        status: "Available"
      });
    }
    await ParkingSlot.create(floor1Slots);
    await ParkingSlot.updateOne({ lot: floor1._id, slot_code: "A01" }, { status: "Occupied", booked_by: users[1]._id });
    await ParkingSlot.updateOne({ lot: floor1._id, slot_code: "A02" }, { status: "Occupied", booked_by: users[2]._id });
    await ParkingSlot.updateOne({ lot: floor1._id, slot_code: "A03" }, { status: "Reserved" });
    await ParkingSlot.updateOne({ lot: floor1._id, slot_code: "A04" }, { status: "Occupied" });

    // Buat data ParkingSlot untuk Floor 2 (Semua penuh)
    const floor2Slots = [];
    for (let i = 1; i <= 27; i++) {
      floor2Slots.push({
        lot: floor2._id,
        slot_code: `B${String(i).padStart(2, '0')}`,
        status: "Occupied" 
      });
    }
    await ParkingSlot.create(floor2Slots);
    console.log("Data Slot Parkir ditambahkan.");

    // Buat Mall 2 (tanpa lantai)
    await Mall.create({
      name: "MALL 2",
      address: "Jl. Parkir Cerdas No. 2, Bandung",
      admin: adminUser._id
    });
    console.log("Data Mall 2 ditambahkan.");


    console.log("✅ Seeder berhasil dijalankan.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder gagal:", err);
    process.exit(1);
  }
};

seedData();