type User = { _id: string; name: string; email: string };

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/users", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  const users = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>
      <ul className="space-y-2">
        {users.map((u: User) => (
          <li key={u._id} className="rounded border p-3">
            <div className="font-semibold">{u.name}</div>
            <div className="text-sm opacity-70">{u.email}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
