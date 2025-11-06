export default function GuestLanding() {
  return (
    <section className="text-center space-y-5">
      <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-600">
        SMARTPARK
      </h1>
      <p className="text-gray-600 text-lg">
        Temukan pengalaman parkir cerdas bersama SmartPark 🚗✨
      </p>
      <div className="flex items-center justify-center gap-3 mt-4">
        <a
          href="/login"
          className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:opacity-90"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-6 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100"
        >
          Register
        </a>
      </div>
    </section>
  );
}