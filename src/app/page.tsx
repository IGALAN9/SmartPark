"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type AppUser = {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
};

export default function HomePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Ambil user dari API (pakai cookie uid)
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        {loading ? (
          <div className="text-gray-500 animate-pulse">Loading...</div>
        ) : user ? (
          // 🔹 Sudah login → tampilkan konten user/admin di tengah
          <div className="text-center space-y-4">
            {user.role === "admin" ? (
              <>
                <h1 className="text-3xl font-bold text-indigo-600">Admin Dashboard 🛠️</h1>
                <p className="text-gray-600">
                  Selamat datang kembali, <span className="font-semibold">{user.name}</span>!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                  <a
                    href="/admin/users"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:opacity-90"
                  >
                    Kelola Pengguna
                  </a>
                  <a
                    href="/admin/reports"
                    className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100"
                  >
                    Lihat Laporan
                  </a>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-indigo-600">User Page 👋</h1>
                <p className="text-gray-600">
                  Halo, <span className="font-semibold">{user.name}</span>! Selamat datang di SmartPark.
                </p>
              </>
            )}
          </div>
        ) : (
          // 🔹 Belum login → tampilkan halaman awal seperti sebelumnya
          <section className="text-center space-y-5">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-600">SMARTPARK</h1>
            <p className="text-gray-600 text-lg">
              Temukan pengalaman parkir cerdas bersama SmartPark 🚗✨
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <a
                href="/login"
                className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:opacity-90"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-6 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100"
              >
                Register
              </a>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
