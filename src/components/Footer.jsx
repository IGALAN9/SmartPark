export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-zinc-600">
        © {new Date().getFullYear()} SMARTPARK
      </div>
    </footer>
  );
}
