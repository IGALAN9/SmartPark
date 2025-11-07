"use client";

import { useState } from "react";

type Slot = {
  _id: string;
  slot_code: string;
  status: "Available" | "Booked" | "Occupied";
  isBookedByMe: boolean;
};

type BookingModalProps = {
  slot: Slot;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BookingModal({ slot, onClose, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tentukan aksi berdasarkan status slot
  const isAvailable = slot.status === "Available";
  const isMyBooking = slot.isBookedByMe;

  // Fungsi untuk memanggil API
  const handleAction = async () => {
    setLoading(true);
    setError("");
    
    // Tentukan endpoint yg akan dipanggil
    const endpoint = isAvailable ? `/api/parking-slots/${slot._id}/book` : `/api/parking-slots/${slot._id}/unbook`;

    try {
      const res = await fetch(endpoint, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aksi gagal");
      
      onSuccess(); // Tutup modal dan refresh
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setLoading(false); // Tetap di modal jika error
    }
  };

  // Tentukan warna dan teks modal
  let bgColor = "bg-gray-700";
  let statusText: string = slot.status;
  if (isMyBooking) {
    bgColor = "bg-blue-600";
    statusText = "My Booking";
  } else if (isAvailable) {
    bgColor = "bg-green-600";
  }

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className={`relative p-8 rounded-2xl shadow-xl w-full max-w-sm text-white ${bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
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
          <h4 className="text-4xl font-semibold mt-1">{statusText}</h4>
        </div>

        {error && <p className="text-sm text-red-300 text-center mt-4">{error}</p>}

        {/* Tombol Aksi */}
        <div className="mt-8">
          <button
            onClick={handleAction}
            disabled={loading}
            className={`w-full px-6 py-4 rounded-lg font-semibold text-lg shadow hover:opacity-90 disabled:opacity-50
              ${isAvailable ? "bg-indigo-500" : "bg-red-500"}
            `}
          >
            {loading ? "Processing..." : (isAvailable ? "BOOK" : "Cancel Booking")}
          </button>
        </div>
      </div>
    </div>
  );
}