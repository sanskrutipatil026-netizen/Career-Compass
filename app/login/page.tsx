import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-blue-700 text-lg">
              MockInterview
            </h1>

            <p className="text-xs text-gray-500">
              AI POWERED
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-10 text-gray-700 font-medium">
          <a href="#">✨Features</a>
          <a href="#">🔍How It Works</a>
          <a href="#">🧩Domains</a>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Get Started →
          </Link>
        </div>

      </div>
    </nav>
  );
}