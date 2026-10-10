"use client";

interface NavbarProps {
  openLogin: () => void;
  openSignup: () => void;
}

export default function Navbar({
  openLogin,
  openSignup,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">

          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
            AI
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              MockInterview
            </h1>

            <p className="text-xs text-gray-500">
              AI Powered
            </p>
          </div>

        </div>

        {/* Menu */}

        <div className="hidden md:flex gap-10 text-gray-700 font-medium">

          <a href="#" className="hover:text-blue-600">
            ✨Features
          </a>

          <a href="#" className="hover:text-blue-600">
            🔍How It Works
          </a>

          <a href="#" className="hover:text-blue-600">
            🧩Domains
          </a>

        </div>

        {/* Buttons */}

        <div className="flex gap-4">

          <button
            onClick={openLogin}
            className="px-6 py-2 border border-blue-600 rounded-full text-blue-600 hover:bg-blue-50 transition"
          >
            Login
          </button>

          <button
            onClick={openSignup}
            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Get Started →
          </button>

        </div>

      </div>
    </nav>
  );
}