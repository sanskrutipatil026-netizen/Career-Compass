"use client";

import React, { useState } from "react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  openLogin: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  openLogin,
}: SignupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[83vh] p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
            AI
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Get Started
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Create your account to begin practicing.
        </p>

        <div className="space-y-4 text-black">
            <label className="font-bold">
                Full Name
            </label>

          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="font-bold">
                Email Address
            </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="font-bold">
                Password
            </label>

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
            Sign Up
          </button>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => {
                onClose();
                openLogin();
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}