"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Cập nhật ngay vào AuthContext (và localStorage)
      setAuth(data.user, data.token);

      // ✅ Gọi callback (nếu có) và đóng modal
      onSignIn?.(data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center text-[#161853] md:text-4xl dark:text-white">
            Member Login
          </h1>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Social login buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
              >
                <Image
                  src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Login with Google
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
              >
                <Image
                  src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
                Login with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-3">
              <hr className="flex-1 border-t border-gray-300" />
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <hr className="flex-1 border-t border-gray-300" />
            </div>

            {/* Email input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your email
              </label>
              <input
                type="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full text-white bg-[#EC255A] hover:bg-[#d02050] font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* Switch to Sign Up */}
            <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet?{" "}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="font-medium text-[#EC255A] hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
