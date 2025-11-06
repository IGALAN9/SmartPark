type AdminDashboardProps = {
  user: {
    name: string;
  };
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-indigo-600">Admin Dashboard 🛠️</h1>
      <p className="text-gray-600">
        Selamat datang kembali,{" "}
        <span className="font-semibold">{user.name}</span>!
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
    </div>
  );
}