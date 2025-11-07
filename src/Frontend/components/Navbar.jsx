"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState(null);          
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }

    const onAuth = () => {
      try {
        const s = localStorage.getItem("user");
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("auth:changed", onAuth);
    return () => window.removeEventListener("auth:changed", onAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Logout API call failed", err);
    }

    try {
      localStorage.removeItem("user");
    } catch {}

    window.location.href = "/";
    
    setUser(null);
    setIsCardOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("Yakin hapus akun secara permanen? Tindakan ini tidak bisa dibatalkan.")) return;

    setDeleting(true);
    try {
      const id = user?._id ?? user?.user_id ?? user?.id;
      if (!id) throw new Error("User ID tidak ditemukan.");

      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun.");

      try { localStorage.removeItem("user"); } catch {}
      setUser(null);
      setIsCardOpen(false); 
      alert("Akun kamu sudah dihapus.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus akun.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur shadow">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-wide text-indigo-600">
          SMARTPARK
        </Link>

        <nav className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:opacity-90">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-lg text-indigo-600">Welcome, {user.name}</span>
              <div className="relative flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center cursor-pointer"
                  onClick={() => setIsCardOpen(!isCardOpen)}
                >
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                </div>

                {isCardOpen && (
                  <div className="absolute top-12 right-0 w-56 bg-white p-4 rounded-xl shadow-lg flex flex-col items-start gap-3">
                    <p className="font-semibold">{user.name}</p>
                    {user.role && <span className="font-medium text-indigo-600">{user.role}</span>}

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-60"
                    >
                      {deleting ? "Deleting..." : "Delete Account"}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
