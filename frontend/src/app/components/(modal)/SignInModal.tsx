"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import OtpModal from "./OtpModal";

export default function SignInModal({
  onClose,
  onSwitchToSignUp,
  onSignIn,
}: {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSignIn?: (user: { id: number; email: string; name?: string; avatarUrl?: string }) => void;
}) {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [tempUserData, setTempUserData] = useState<{ email: string; password: string } | null>(null);

  // --- LOGIN LẦN ĐẦU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Nếu backend yêu cầu OTP
      if (data.requiresOtp) {
        setRequiresOtp(true);
        setTempUserData({ email, password });
        return;
      }

      // Nếu không cần OTP → login thẳng
      setAuth(data.user, data.token);
      onSignIn?.(data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY OTP ---
  const handleOtpSubmit = async (otp: string) => {
    if (!tempUserData) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tempUserData, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "OTP verification failed");
        return;
      }

      setAuth(data.user, data.token);
      onSignIn?.(data.user);
      onClose();
      setRequiresOtp(false);
      setTempUserData(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SIGN IN MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>

          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-2xl font-bold text-center text-[#161853] md:text-4xl dark:text-white">
              Member Login
            </h1>

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {/* Social login */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/login/googleAuth`
                  }
                  className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
                >
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width={20} height={20} />
                  Login with Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
                >
                  Login with Facebook
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-3">
                <hr className="flex-1 border-t border-gray-300" />
                <span className="mx-2 text-gray-400 text-sm">or</span>
                <hr className="flex-1 border-t border-gray-300" />
              </div>

              {/* Email + Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                <input type="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                <input type="password" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" className="w-full text-white bg-[#EC255A] hover:bg-[#d02050] font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-70" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <button type="button" onClick={onSwitchToSignUp} className="font-medium text-[#EC255A] hover:underline">Sign up</button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* OTP MODAL */}
      {requiresOtp && <OtpModal onSubmit={handleOtpSubmit} onClose={() => setRequiresOtp(false)} />}
    </>
  );
}
