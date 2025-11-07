"use client";

import { useState, useEffect } from "react";
import UserFloorDetailView from "./UserFloorDetailView"; 

type FloorData = {
  id: string;
  name: string;
  available: number;
  total: number;
};
type MallData = {
  id: string;
  name: string;
  address: string;
  floors: FloorData[];
};
type UserProps = {
  _id: string; 
  name: string;
};


type UserDashboardProps = {
  user: UserProps;
};

  // STATE UNTUK NAVIGASI
export default function UserDashboard({ user }: UserDashboardProps) {
  const [viewingFloor, setViewingFloor] = useState<{
    id: string;
    mallName: string;
    floorName: string;
  } | null>(null);
  
  const [openMallId, setOpenMallId] = useState<string | null>(null);
  const [malls, setMalls] = useState<MallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPublicMalls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/malls/public");
      if (!res.ok) throw new Error("Gagal mengambil data parkir.");
      const data = await res.json();
      setMalls(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // FETCH DATA SAAT KEMBALI DARI DETAIL VIEW
  useEffect(() => {
    if (!viewingFloor) {
        fetchPublicMalls();
    }
  }, [viewingFloor]);

  // JIKA USER KLIK LANTAI, TAMPILKAN DETAIL VIEW
  if (viewingFloor) {
    return (
      <UserFloorDetailView
        floor={viewingFloor}
        user={user} // Kirim info user
        onBack={() => setViewingFloor(null)}
      />
    );
  }

  // TAMPILKAN DASHBOARD UTAMA (MALL LIST)
  if (loading) return <div className="text-center p-8 text-lg">Mencari parkir tersedia...</div>;
  if (error) return <div className="text-center p-8 text-lg text-red-600">Error: {error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
        Available Parking
      </h2>

      <div className="space-y-6">
        {malls.length === 0 && (
          <p className="text-center text-gray-500">
            Belum ada data parkir yang tersedia saat ini.
          </p>
        )}

        {malls.map((mall) => (
          <div key={mall.id} className="bg-white p-6 rounded-2xl shadow-md">
            {/* Header Card Mall */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <h3 className="text-2xl font-bold text-indigo-700">{mall.name}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{mall.address}</p>
              </div>
              <button 
                onClick={() => setOpenMallId(openMallId === mall.id ? null : mall.id)}
                className="mt-4 sm:mt-0 px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200"
              >
                {openMallId === mall.id ? "Close" : "Details>>>"}
              </button>
            </div>

            {/* Info Lantai (Ringkasan) */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {/* ... (Tampilan ringkasan lantai - tidak berubah) ... */}
              </div>
            </div>

            {/* Panel "Book" (muncul saat "Details" diklik) */}
            {openMallId === mall.id && (
              <div className="mt-4 pt-4 border-t border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                {mall.floors.length > 0 ? mall.floors.map((floor) => (
                  <div key={floor.id} className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {floor.name} 
                      <span className="ml-2 text-sm text-gray-600">
                        (Available: {floor.available}/{floor.total})
                      </span>
                    </span>
                    
                    {/* 6. TOMBOL INI SEKARANG PINDAH KE DETAIL VIEW */}
                    <button
                      onClick={() => setViewingFloor({
                        id: floor.id,
                        mallName: mall.name,
                        floorName: floor.name
                      })}
                      disabled={floor.available === 0}
                      className="px-5 py-1 bg-white text-indigo-700 rounded-full text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {floor.available === 0 ? "Full" : "View Slots"}
                    </button>
                  </div>
                )) : (
                   <p className="text-center text-gray-500">Tidak ada lantai di mall ini.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}