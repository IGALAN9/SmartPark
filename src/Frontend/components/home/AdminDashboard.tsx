// Frontend/app/components/AdminDashboard.tsx
"use client";

import { useState, useEffect } from "react";
// Kita akan buat file ini di langkah berikutnya
import AddMallModal from "./admin/AddMallModal"; 

// Definisikan tipe data yang akan kita terima dari API
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

// Props 'user' tetap ada dari file asli Anda
type AdminDashboardProps = {
  user: {
    name: string;
  };
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMallId, setEditingMallId] = useState<string | null>(null);
  
  // State untuk menampung data dari API
  const [malls, setMalls] = useState<MallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fungsi untuk fetch data
  const fetchMalls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/malls"); // Panggil API yang sudah kita buat
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

  // Fetch data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchMalls();
  }, []);

  const handleAddMallSuccess = () => {
    setIsModalOpen(false);
    fetchMalls(); // Ambil ulang data setelah berhasil menambah mall
    alert("Mall berhasil ditambahkan!");
  };

  if (loading) return <div className="text-center p-8 text-lg">Memuat data parkir...</div>;
  if (error) return <div className="text-center p-8 text-lg text-red-600">Error: {error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {/* Judul Halaman */}
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
        Available Parking
      </h2>

      {/* Tombol Add Mall */}
      <div className="text-center mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
        >
          ADD MALL
        </button>
      </div>

      {/* Daftar Mall */}
      <div className="space-y-6">
        {malls.length === 0 && (
          <p className="text-center text-gray-500">Belum ada mall terdaftar. Klik ADD MALL untuk memulai.</p>
        )}

        {malls.map((mall) => (
          <div key={mall.id} className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <h3 className="text-2xl font-bold text-indigo-700">{mall.name}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{mall.address}</p>
              </div>
              <button 
                onClick={() => setEditingMallId(editingMallId === mall.id ? null : mall.id)}
                className="mt-4 sm:mt-0 px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200"
              >
                {editingMallId === mall.id ? "Close" : "Details>>>"}
              </button>
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

            {/* Bagian Edit Floor */}
            {editingMallId === mall.id && (
              <div className="mt-4 pt-4 border-t border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                {mall.floors.map((floor) => (
                  <div key={floor.id} className="flex items-center justify-between mb-2">
                    <span className="font-medium">{floor.name} ({floor.available}/{floor.total} slots)</span>
                    <button className="px-4 py-1 bg-white text-indigo-700 rounded-full text-sm shadow-sm hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                ))}
                {/* TODO: Buat logika Add Floor */}
                <button className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700">
                  Add Floor
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Mall (akan muncul jika isModalOpen true) */}
      {isModalOpen && (
        <AddMallModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleAddMallSuccess}
        />
      )}
    </div>
  );
}