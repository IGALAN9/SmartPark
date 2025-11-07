"use client";

import { useState, useEffect } from "react";
import UpdateSlotModal from "./UpdateSlotModal"; // Modal dari langkah berikutnya

// Tipe data untuk 1 slot
type Slot = {
  _id: string;
  slot_code: string;
  status: "Available" | "Booked" | "Occupied";
};

// Props yang diterima dari AdminDashboard
type FloorDetailProps = {
  floor: {
    id: string; // Ini adalah lotId
    mallName: string;
    floorName: string;
  };
  onBack: () => void; // Fungsi untuk kembali
};

export default function FloorDetailView({ floor, onBack }: FloorDetailProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // State untuk melacak slot mana yang dipilih
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Panggil API GET /api/parking-slots
      const res = await fetch(`/api/parking-slots?lotId=${floor.id}`);
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
  }, [floor.id]); // Ambil data saat floor ID berubah

  // Panggil API POST /api/parking-slots
  const handleAddSlot = async () => {
    try {
      const res = await fetch("/api/parking-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId: floor.id }),
      });
      if (!res.ok) throw new Error("Gagal menambah slot");
      fetchSlots(); // Refresh data
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  };

  // Panggil API DELETE /api/parking-slots/:id
  const handleDeleteSlot = async (slotId: string, slotCode: string) => {
    if (!window.confirm(`Yakin ingin menghapus slot "${slotCode}"?`)) return;
    try {
      const res = await fetch(`/api/parking-slots/${slotId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus slot");
      fetchSlots(); // Refresh data
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  };

  // Fungsi untuk memberi warna kotak
  const getStatusColor = (status: Slot["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500 hover:bg-green-600";
      case "Booked": return "bg-yellow-400 hover:bg-yellow-500";
      case "Occupied": return "bg-red-600 hover:bg-red-700";
    }
  };

  // Buka modal saat slot diklik
  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
  };
  
  // Fungsi untuk menutup & me-refresh
  const handleModalSuccess = () => {
    setSelectedSlot(null);
    fetchSlots(); // Refresh grid
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200"
      >
        &lt;&lt; Back to Mall List
      </button>

      <h2 className="text-3xl font-bold text-center text-indigo-600">{floor.mallName}</h2>
      <p className="text-xl font-semibold text-center text-gray-700 mb-6">{floor.floorName}</p>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-500"></div>
          <span className="text-sm font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-yellow-400"></div>
          <span className="text-sm font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-600"></div>
          <span className="text-sm font-medium">Occupied</span>
        </div>
      </div>

      {loading && <p className="text-center">Loading slots...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Grid of Slots */}
      <div className="flex flex-wrap justify-center gap-4 p-4 bg-white rounded-lg shadow">
        {slots.map((slot) => (
          <div key={slot._id} className="relative">
            <button
              onClick={() => handleSlotClick(slot)}
              className={`w-16 h-16 rounded-lg text-white font-bold text-xl ${getStatusColor(slot.status)} transition-colors`}
            >
              {slot.slot_code}
            </button>
            {/* Tombol Delete Kecil */}
            <button
              onClick={() => handleDeleteSlot(slot._id, slot.slot_code)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 text-white rounded-full text-sm font-bold flex items-center justify-center hover:bg-red-600"
              title="Delete slot"
            >
              &times;
            </button>
          </div>
        ))}
        
        {/* Tombol Add Slot */}
        <button
          onClick={handleAddSlot}
          className="w-16 h-16 rounded-lg bg-gray-200 text-gray-600 font-bold text-3xl flex items-center justify-center hover:bg-gray-300"
          title="Add new slot"
        >
          +
        </button>
      </div>

      {/* Modal untuk update status */}
      {selectedSlot && (
        <UpdateSlotModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}