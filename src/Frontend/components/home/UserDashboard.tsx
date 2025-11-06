type UserDashboardProps = {
  user: {
    name: string;
  };
};

export default function UserDashboard({ user }: UserDashboardProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-indigo-600">User Page 👋</h1>
      <p className="text-gray-600">
        Halo, <span className="font-semibold">{user.name}</span>! Selamat datang
        di SmartPark.
      </p>
    </div>
  );
}