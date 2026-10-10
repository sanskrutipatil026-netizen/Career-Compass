"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">

      <Navbar
        openLogin={() => setLoginOpen(true)}
        openSignup={() => setSignupOpen(true)}
      />

      <div className="flex flex-col items-center justify-center h-screen text-center">

      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        openLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />

    </main>
  );
}