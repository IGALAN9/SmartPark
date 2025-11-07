"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");

      setName(data.name); 
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth:changed")); 
      router.push("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-4xl font-extrabold text-center text-indigo-600">Login</h1>
      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Don’t have an account?{" "}
        <a href="/register" className="text-indigo-600 font-medium hover:underline">Register</a>
      </p>
    </main>
    </>
  );
}
