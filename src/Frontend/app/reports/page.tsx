"use client";

import Link from "next/link";
import AdminAnalytics from "../../components/home/admin/AdminAnalytics";

export default function ReportsPage() {
  return (
    <main className="w-full max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="mb-6 inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200"
      >
        &lt;&lt; Kembali ke Dashboard
      </Link>
      
      <AdminAnalytics />
    </main>
  );
}