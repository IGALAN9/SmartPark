"use client";

import { useState, useEffect } from "react";
import AddMallModal from "./admin/AddMallModal";
import FloorDetailView from "./admin/FloorDetailView"; 

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

type AdminDashboardProps = {
  user: {
    name: string;
  };
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [viewingFloor, setViewingFloor] = useState<{
    id: string;
    mallName: string;
    floorName: string;
  } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMallId, setEditingMallId] = useState<string | null>(null);
  const [malls, setMalls] = useState<MallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Fungsi API untuk Fitur Parkir ---
  const fetchMalls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/malls"); 
      if (!res.ok) {
        throw new Error("Gagal mengambil data. Pastikan Anda login sebagai Admin.");
      }
      const data = await res.json();
      setMalls(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data mall saat komponen dimount
  useEffect(() => {
    if (!viewingFloor) {
      fetchMalls();
    }
  }, [viewingFloor]); 

  const handleAddMallSuccess = () => {
    setIsModalOpen(false);
    fetchMalls(); 
    alert("Mall berhasil ditambahkan!");
  };

  const handleDeleteMall = async (mallId: string, mallName: string) => {
    if (!window.confirm(`Yakin ingin menghapus "${mallName}"?\nSEMUA lantai dan slot di dalamnya akan terhapus permanen.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/malls/${mallId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus mall");
      alert(`"${mallName}" berhasil dihapus.`);
      fetchMalls(); // Refresh list
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fungsi untuk menghapus lantai
  const handleDeleteFloor = async (floorId: string, floorName: string) => {
    if (!window.confirm(`Yakin ingin menghapus "${floorName}"?\nSEMUA slot di dalamnya akan terhapus permanen.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/parking-lots/${floorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus lantai");
      alert(`"${floorName}" berhasil dihapus.`);
      fetchMalls(); 
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fungsi untuk menambahkan lantai dengan nama otomatis
  const handleAutoAddFloor = async (mall: MallData) => {
    setIsDeleting(true); 
    
    const nextFloorNum = mall.floors.length + 1;
    const newFloorName = `Floor ${nextFloorNum}`;

    try {
      const res = await fetch("/api/parking-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mallId: mall.id,
          floorLevel: newFloorName
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Tangani jika nama duplikat (misal: admin hapus "Floor 2" lalu "Add Floor" lagi)
        if (data.error && data.error.includes("already exists")) {
          alert(`Gagal: Lantai dengan nama "${newFloorName}" sudah ada. Coba ubah nama lantai yang ada.`);
        } else {
          throw new Error(data.error || "Gagal menambahkan lantai");
        }
      } else {
        // Refresh list mall untuk melihat lantai baru 
        fetchMalls();
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false); 
    }
  };


  if (viewingFloor) {
    return (
      <FloorDetailView 
        floor={viewingFloor}
        onBack={() => {
          setViewingFloor(null); 
        }}
      />
    );
  }

  // --- Render Dashboard Admin ---
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-indigo-600">Admin Dashboard 🛠️</h1>
        <p className="text-gray-600">
          Selamat datang kembali,{" "}
          <span className="font-semibold">{user.name}</span>!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <a
            href="/admin/reports"
            className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100"
          >
            Lihat Laporan
          </a>
        </div>
      </div>

      <hr className="border-gray-300" />

      <div>
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Parking Management
        </h2>

        <div className="text-center mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
          >
            ADD MALL
          </button>
        </div>

        {loading && <div className="text-center p-8 text-lg">Memuat data parkir...</div>}
        {error && <div className="text-center p-8 text-lg text-red-600">Error: {error}</div>}
        
        {!loading && !error && (
          <div className="space-y-6">
            {malls.length === 0 && (
              <p className="text-center text-gray-500">
                Belum ada mall terdaftar. Klik ADD MALL untuk memulai.
              </p>
            )}

            {malls.map((mall) => (
              <div key={mall.id} className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-700">{mall.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{mall.address}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button 
                      onClick={() => setEditingMallId(editingMallId === mall.id ? null : mall.id)}
                      disabled={isDeleting}
                      className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200 disabled:opacity-50"
                    >
                      {editingMallId === mall.id ? "Close" : "Details>>>"}
                    </button>
                    <button
                      onClick={() => handleDeleteMall(mall.id, mall.name)}
                      disabled={isDeleting}
                      className="px-5 py-2 bg-red-100 text-red-700 rounded-full font-medium text-sm hover:bg-red-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {mall.floors.length > 0 ? mall.floors.map((floor) => (
                      <span key={floor.id} className="font-medium text-gray-700">
                        {floor.name} <b className="text-gray-900">{floor.available}/{floor.total}</b>
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">Belum ada lantai terdaftar.</span>
                    )}
                  </div>
                </div>

                {editingMallId === mall.id && (
                  <div className="mt-4 pt-4 border-t border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                    {mall.floors.map((floor) => (
                      <div key={floor.id} className="flex items-center justify-between mb-2">
                        <span className="font-medium">{floor.name} ({floor.available}/{floor.total} slots)</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingFloor({ 
                              id: floor.id, 
                              mallName: mall.name, 
                              floorName: floor.name 
                            })}
                            disabled={isDeleting}
                            className="px-4 py-1 bg-white text-indigo-700 rounded-full text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                            Edit Slots
                          </button>
                          <button
                            onClick={() => handleDeleteFloor(floor.id, floor.name)}
                            disabled={isDeleting}
                            className="px-4 py-1 bg-white text-red-700 rounded-full text-sm shadow-sm hover:bg-red-100 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  <button 
                    onClick={() => handleAutoAddFloor(mall)} 
                    className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700"
                    disabled={isDeleting} 
                  >
                    {isDeleting ? "Adding..." : "Add Floor"}
                  </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddMallModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleAddMallSuccess}
        />
      )}
    </div>
  );
}