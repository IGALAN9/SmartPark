"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Register failed");
      router.push("/Login");
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg); // contoh di login/register
    } finally {
        setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mt-24 w-full max-w-xl rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-4xl font-extrabold text-center text-indigo-600">Register</h1>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Name</label>
              <input
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={name} onChange={(e)=>setName(e.target.value)} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={email} onChange={(e)=>setEmail(e.target.value)} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={password} onChange={(e)=>setPassword(e.target.value)} required
              />
            </div>

            {err && <p className="text-red-600 text-sm">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-indigo-600 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <a href="/Login" className="text-indigo-600 font-medium hover:underline">Login</a>
          </p>
        </div>
      </main>
    </>
  );
}
