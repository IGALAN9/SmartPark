"use client";

import { useState } from "react";

type Slot = {
  _id: string;
  slot_code: string;
  status: "Available" | "Booked" | "Occupied";
};

type UpdateSlotModalProps = {
  slot: Slot;
  onClose: () => void;
  onSuccess: () => void; // Untuk me-refresh grid
};

export default function UpdateSlotModal({ slot, onClose, onSuccess }: UpdateSlotModalProps) {
  const [loading, setLoading] = useState(false);

  // Panggil API PATCH /api/parking-slots/:id/status
  const handleUpdate = async (newStatus: Slot["status"]) => {
    if (slot.status === newStatus) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/parking-slots/${slot._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal update status");
      }
      
      onSuccess(); // Panggil onSuccess untuk refresh & tutup
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
      setLoading(false); // Tetap buka modal jika error
    }
  };

  // Memberi warna latar modal
  const getStatusColorClass = () => {
    switch (slot.status) {
      case "Available": return "bg-green-600";
      case "Booked": return "bg-yellow-500";
      case "Occupied": return "bg-red-700";
    }
  };

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // Tutup modal jika klik di luar
    >
      {/* Modal Content */}
      <div
        className={`relative p-8 rounded-2xl shadow-xl w-full max-w-sm text-white ${getStatusColorClass()}`}
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik
      >
        {/* Tombol Close (X) */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 text-white text-xl font-bold hover:bg-black/40"
          disabled={loading}
        >
          &times;
        </button>

        <div className="text-center">
          <h3 className="text-7xl font-bold">{slot.slot_code}</h3>
          <p className="text-lg font-light text-white/90 mt-1">Status</p>
          <h4 className="text-4xl font-semibold mt-1">{slot.status}</h4>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            onClick={() => handleUpdate("Available")}
            disabled={loading || slot.status === "Available"}
            className="px-4 py-3 rounded-lg bg-green-500 font-semibold shadow hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Available
          </button>
          <button
            onClick={() => handleUpdate("Booked")}
            disabled={loading || slot.status === "Booked"}
            className="px-4 py-3 rounded-lg bg-yellow-400 font-semibold shadow hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Booked
          </button>
          <button
            onClick={() => handleUpdate("Occupied")}
            disabled={loading || slot.status === "Occupied"}
            className="px-4 py-3 rounded-lg bg-red-600 font-semibold shadow hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Occupied
          </button>
        </div>
      </div>
    </div>
  );
}