"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import GuestLanding from "../components/home/GuestLanding";
import UserDashboard from "../components/home/UserDashboard";
import AdminDashboard from "../components/home/AdminDashboard";

type AppUser = {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
};

export default function HomePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="text-gray-500 animate-pulse">Loading...</div>;
    }

    if (!user) {
      return <GuestLanding />;
    }

    if (user.role === "admin") {
      return <AdminDashboard user={user} />;
    }

    return <UserDashboard user={user} />;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        {renderContent()}
      </main>
    </>
  );
}