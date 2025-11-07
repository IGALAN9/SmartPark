"use client";

import { useState, useEffect } from "react";
import BookingModal from "./BookingModal"; // Komponen baru (langkah 4)

// Tipe data slot dari API publik (termasuk status 'isBookedByMe')
type Slot = {
  _id: string;
  slot_code: string;
  status: "Available" | "Booked" | "Occupied";
  isBookedByMe: boolean; 
};
type UserProps = {
  _id: string;
  name: string;
};

// Props
type FloorDetailProps = {
  floor: {
    id: string; // lotId
    mallName: string;
    floorName: string;
  };
  user: UserProps; // Kita perlu info user
  onBack: () => void;
};

export default function UserFloorDetailView({ floor, user, onBack }: FloorDetailProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Panggil API publik baru
      const res = await fetch(`/api/parking-slots/public?lotId=${floor.id}`);
      if (!res.ok) throw new Error("Gagal mengambil data slot");
      const data = await res.json();
      setSlots(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [floor.id]);

  // Mengembalikan warna slot
  const getStatusColor = (slot: Slot) => {
    // Jika di-book oleh user ini, beri warna khusus (misal: biru)
    if (slot.isBookedByMe) {
        return "bg-blue-500 hover:bg-blue-600";
    }
    switch (slot.status) {
      case "Available": return "bg-green-500 hover:bg-green-600";
      case "Booked": return "bg-yellow-400 opacity-70"; // Booked org lain
      case "Occupied": return "bg-red-600 opacity-70"; // Occupied
    }
  };
  
  // Buka modal HANYA jika slot Available atau di-book oleh user
  const handleSlotClick = (slot: Slot) => {
    if (slot.status === "Available" || slot.isBookedByMe) {
        setSelectedSlot(slot);
    }
    // Jika Occupied atau Booked org lain, tidak terjadi apa-apa
  };
  
  const handleModalSuccess = () => {
    setSelectedSlot(null);
    fetchSlots(); // Refresh grid
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {/* Tombol Back & Judul */}
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200">
        &lt;&lt; Back
      </button>
      <h2 className="text-3xl font-bold text-center text-indigo-600">{floor.mallName}</h2>
      <p className="text-xl font-semibold text-center text-gray-700 mb-6">{floor.floorName}</p>

      {/* Legend (tambah 1 warna) */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-green-500"></div><span className="text-sm">Available</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-blue-500"></div><span className="text-sm">My Booking</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-yellow-400"></div><span className="text-sm">Booked</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-red-600"></div><span className="text-sm">Occupied</span></div>
      </div>

      {loading && <p className="text-center">Loading slots...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Grid of Slots (Read-only) */}
      <div className="flex flex-wrap justify-center gap-4 p-4 bg-white rounded-lg shadow">
        {slots.map((slot, index) => (
          // Logic pilar (mr-8)
          <div 
            key={slot._id} 
            className={`relative ${(index + 1) % 3 === 0 ? 'mr-8' : ''}`}
          >
            <button
              onClick={() => handleSlotClick(slot)}
              disabled={slot.status === 'Occupied' || (slot.status === 'Booked' && !slot.isBookedByMe)}
              className={`w-16 h-16 rounded-lg text-white font-bold text-xl ${getStatusColor(slot)} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {slot.slot_code}
            </button>
            {/* TIDAK ADA tombol delete 'x' */}
          </div>
        ))}
        {/* TIDAK ADA tombol add '+' */}
      </div>

      {/* Modal Booking */}
      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}