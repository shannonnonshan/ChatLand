"use client";

import { useState } from "react";

export default function OtpModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (otp: string) => void;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(otp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white">Enter OTP</h2>
          <p className="text-center text-gray-500 dark:text-gray-300">A one-time password has been sent to your email</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" maxLength={6} className="w-full p-2 border rounded-lg text-center" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <button type="submit" className="w-full bg-[#EC255A] text-white rounded-lg p-2 font-medium disabled:opacity-70" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
