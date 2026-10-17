"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
const router = useRouter();
const searchParams = useSearchParams();

const token = searchParams.get("token");

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();


setError("");
setMessage("");

if (!token) {
  setError("Invalid or missing password reset link.");
  return;
}

if (!password || !confirmPassword) {
  setError("Please enter and confirm your new password.");
  return;
}

if (password.length < 8) {
  setError("Password must be at least 8 characters.");
  return;
}

if (password !== confirmPassword) {
  setError("Passwords do not match.");
  return;
}

try {
  setLoading(true);

  const response = await fetch(
    "https://career-compass-backend-v8sv.onrender.com/api/auth/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Unable to reset password.");
    return;
  }

  setMessage("Password reset successfully!");

  setPassword("");
  setConfirmPassword("");

  setTimeout(() => {
    router.push("/newlogin");
  }, 2000);
} catch (error) {
  console.error(error);
  setError("Unable to connect to the server.");
} finally {
  setLoading(false);
}


};

return ( <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fef3c7] via-[#fff8e7] to-[#f5e6d3] px-4 text-[#3d2e22]"> <section className="w-full max-w-md rounded-3xl border border-[#a67b5b]/20 bg-[#fffdf8]/95 p-8 shadow-2xl"> <div className="text-center"> <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a67b5b]">
Career Compass </p>


      <h1 className="mt-3 font-serif text-4xl font-bold text-[#8b6347]">
        Reset Password
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[#6b5344]">
        Create a new password for your Career Compass account.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#6b5344]">
          New password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 pr-16 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a67b5b]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <p className="mt-1 text-xs text-[#9a7f6a]">
          Password must be at least 8 characters.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#6b5344]">
          Confirm new password
        </label>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 pr-16 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a67b5b]"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#a67b5b] px-4 py-3 font-semibold text-white shadow-lg shadow-[#a67b5b]/25 transition hover:bg-[#8b6347] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>

    <button
      type="button"
      onClick={() => router.push("/newlogin")}
      className="mt-6 w-full text-center text-sm font-medium text-[#8b6347] hover:underline"
    >
      ← Back to Sign in
    </button>
  </section>
</main>


);
}

export default function ResetPasswordPage() {
return (
<Suspense
fallback={ <main className="flex min-h-screen items-center justify-center bg-[#fff8e7] text-[#8b6347]">
Loading reset-password page... </main>
}
> <ResetPasswordForm /> </Suspense>
);
}
