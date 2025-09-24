"use client";

import { useState } from "react";

export default function SignUpModal({
  onClose,
  onSwitchToLogin,
}: {
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log({ email, password, acceptTerms });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-center leading-tight tracking-tight text-[#161853] md:text-2xl dark:text-white">
              Create an account
            </h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-[#EC255A] focus:border-[#EC255A] block w-full p-2.5 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-[#EC255A] focus:border-[#EC255A] block w-full p-2.5 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-[#EC255A] focus:border-[#EC255A] block w-full p-2.5 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>

            {/* Accept terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 
                    focus:ring-3 focus:ring-[#EC255A] dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="terms"
                  className="font-light text-gray-500 dark:text-gray-300"
                >
                  I accept the{" "}
                  <a
                    className="font-medium text-[#EC255A] hover:underline"
                    href="#"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full text-white bg-[#EC255A] hover:bg-[#d02050] font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Create an account
            </button>

            {/* Switch to login */}
            <p className="text-sm text-end font-light text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="font-medium text-[#EC255A] hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
