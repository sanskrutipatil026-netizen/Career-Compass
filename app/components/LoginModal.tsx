"use client";

import React, { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  openSignup: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  openSignup,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <div className="flex justify-center mb-4">

          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
            AI
          </div>

        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
       

        <p className="text-center text-gray-500 mt-2 mb-8">
          Sign in to continue your interview practice.
        </p>

        <div className="space-y-5">

          <div className="text-black ">

            <label className="block text-s font-bold mb-2">
              Email Address
              </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <div className="text-black">

            <label className="block text-sm font-bold mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Sign In
          </button>

          <p className="text-center text-gray-600">

            Don't have an account?{" "}

            <button
              onClick={() => {
                onClose();
                openSignup();
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create one
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}