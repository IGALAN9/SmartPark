import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4">
        <section className="relative mt-20 mb-28">
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                          from-indigo-200 via-white to-indigo-100/40 -z-10" />
          <div className="flex flex-col items-center text-center py-24">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-indigo-600">
              Welcome to SMARTPARK
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Your solution to parking
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/register" className="px-5 py-3 rounded-full bg-indigo-600 text-white font-medium hover:opacity-90">
                Get Started
              </Link>
              <Link href="/login" className="px-5 py-3 rounded-full bg-white text-indigo-700 font-medium shadow hover:bg-zinc-50">
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
