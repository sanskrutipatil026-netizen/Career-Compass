"use client";
import {useRouter} from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState("");
const router=useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [terms, setTerms] = useState(false);

  const isSignup = mode === "signup";

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRemember(false);
    setTerms(false);
  };

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  if (!username.trim() || !password) {
    setError("Email and password are required.");
    return;
  }

  try {
    // SIGNUP
    if (isSignup) {
      if (!fullName.trim()) {
        setError("Full name is required.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!terms) {
        setError("Please agree to the Terms and Privacy Policy.");
        return;
      }

      const response = await fetch(
        "https://career-compass-backend-v8sv.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            email: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      alert("Account created successfully! Please sign in.");
      changeMode("signin");
      return;
    }

    // LOGIN USING NEXTAUTH CREDENTIALS
    const result = await signIn("credentials", {
      email: username,
      password: password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    if (result?.ok) {
      alert("Signed in successfully!");
      router.push("/personalD");
    }
  } catch (error) {
    console.error(error);
    setError("Unable to connect to the server.");
  }
};
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fff8e7] to-[#f5e6d3] text-[#3d2e22]">
      {/* Top Navigation */}
      <header className="w-full">
        <div className="mx-auto flex w-[min(980px,calc(100%-2rem))] justify-end py-5">
          <nav className="flex gap-5 text-sm font-medium text-[#6b5344]">
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="hover:text-[#8b6347]"
            >
              Help
            </button>

            <button
              type="button"
              onClick={() => changeMode("signup")}
              className="hover:text-[#8b6347]"
            >
              Sign up
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto grid min-h-[calc(100vh-180px)] w-[min(980px,calc(100%-2rem))] items-center gap-10 py-8 md:grid-cols-2">
        {/* Left Side */}
        <section className="animate-[fadeIn_.7s_ease-out]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a67b5b]">
            Welcome to
          </p>

          <h1 className="font-serif text-5xl font-bold text-[#8b6347] md:text-6xl">
            Career Compass
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6b5344]">
            Sign in to upload resumes, track interviews, and surface the
            skills that match each role.
          </p>
        </section>

        {/* Auth Panel */}
        <section className="rounded-3xl border border-[#a67b5b]/20 bg-[#fffdf8]/90 p-6 shadow-2xl backdrop-blur-md">
          {/* Tabs */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-[#a67b5b]/15 p-1">
            <button
              type="submit"
              onClick={() => changeMode("signin")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !isSignup
                  ? "bg-[#fffdf8] text-[#8b6347] shadow"
                  : "text-[#6b5344]"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isSignup
                  ? "bg-[#fffdf8] text-[#8b6347] shadow"
                  : "text-[#6b5344]"
              }`}
            >
              Sign up
            </button>
          </div>

          <h2 className="text-xl font-semibold">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </h2>

          <p className="mb-5 mt-1 text-sm text-[#9a7f6a]">
            {isSignup
              ? "Choose a username and password to get started."
              : "Enter your username and password to continue."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            {isSignup && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6b5344]">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
                />
              </div>
            )}

            {/* Username */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#6b5344]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
              />
            </div>

           

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-[#6b5344]">
                  Password
                </label>

                {!isSignup && (
                  <button
                 type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-[#8b6347] hover:underline"
                   >
                Forgot password?
                 </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 pr-20 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a67b5b]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isSignup && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6b5344]">
                  Confirm password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
                />
              </div>
            )}

            {/* Sign In Options */}
            {!isSignup && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6b5344]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[#a67b5b]"
                />
                Remember me
              </label>
            )}

            {/* Signup Terms */}
            {isSignup && (
              <label className="flex cursor-pointer items-start gap-2 text-sm text-[#6b5344]">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#a67b5b]"
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="font-medium text-[#8b6347] hover:underline"
                  >
                    Terms
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="font-medium text-[#8b6347] hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            )}

            {/* Error */}
            {error && (
              <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#a67b5b] px-4 py-3 font-semibold text-[#fffdf8] shadow-lg shadow-[#a67b5b]/25 transition hover:bg-[#8b6347] active:translate-y-[1px]"
            >
              {isSignup ? "Sign up" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-[#9a7f6a]">
            <div className="h-px flex-1 bg-[#a67b5b]/20" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-[#a67b5b]/20" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/personalD" })}
              className="rounded-xl border border-[#a67b5b]/25 bg-[#fffdf8] py-3 text-sm font-medium text-[#6b5344] transition hover:bg-[#fef3c7]"
            >
              Google
            </button>

            
          </div>

          {/* Switch Mode */}
          <p className="mt-5 text-center text-sm text-[#6b5344]">
            {isSignup ? "Already have an account? " : "New here? "}

            <button
              type="button"
              onClick={() => changeMode(isSignup ? "signin" : "signup")}
              className="font-semibold text-[#8b6347] hover:underline"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center">
        <div className="mb-2 flex justify-center gap-5 text-sm text-[#6b5344]">
          <button onClick={() => setShowHelp(true)}>Help Center</button>
          <button>Privacy</button>
          <button>Terms</button>
        </div>

        <p className="text-xs text-[#9a7f6a]">
          Having trouble signing in? Reset your password or reach support.
        </p>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d2e22]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#a67b5b]/20 bg-[#fffdf8] p-6 shadow-2xl">
            <h3 className="font-serif text-3xl font-bold text-[#8b6347]">
              Need help?
            </h3>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#6b5344]">
              <li>Use the username you registered with.</li>
              <li>Passwords must be at least 8 characters.</li>
              <li>Use Forgot password if you cannot sign in.</li>
              <li>Still stuck? Contact support.</li>
            </ul>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-xl bg-[#a67b5b] py-3 font-semibold text-white hover:bg-[#8b6347]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}