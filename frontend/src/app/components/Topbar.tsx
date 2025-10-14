"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User } from "lucide-react";
import SignInModal from "./(modal)/SignInModal";
import SignUpModal from "./(modal)/SignUpModal";
import SearchUserModal from "./(modal)/SearchUserModal"; // import modal search
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const { user, logout, token, setAuth } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // state modal search
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) setTwoFAEnabled(user.twoFactorEnabled || false);
  }, [user]);

  const handleTwoFAToggle = async () => {
    if (!user || !token || loading2FA) return;
    setLoading2FA(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/${user.id}/2fa`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ twoFactorEnabled: !twoFAEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update 2FA");
      setTwoFAEnabled(data.twoFactorEnabled);
      setAuth({ ...user, twoFactorEnabled: data.twoFactorEnabled }, token);
    } catch (err) {
      console.error("Failed to update 2FA:", err);
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain" />
        <span className="text-xl font-bold text-black dark:text-white">Chat Land</span>
      </div>

      {/* Search + Bell + Avatar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-3 pr-8 py-1.5 rounded-md border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
            readOnly
            onFocus={() => {
              if (!user) {
                setShowSignIn(true); // chưa login → show sign-in
              } else {
                setShowSearch(true); // đã login → show search modal
              }
            }}
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
        {/* Notification */}
        <button
          onClick={() => router.push(`/announcements/${user?.id}`)}
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              if (!user) setShowSignIn(true);
              else setShowMenu(!showMenu);
            }}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-300 hover:ring-2 hover:ring-blue-400 transition"
          >
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt="avatar" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 mx-auto my-[7px] text-gray-600" />
            )}
          </button>

          {/* User Menu */}
          {user && showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 text-sm">
                <p className="font-semibold truncate max-w-[90%]">{user.name}</p>
                <p className="text-gray-500 truncate max-w-[90%]">{user.email}</p>
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">2-Factor</span>
                <button
                  onClick={handleTwoFAToggle}
                  disabled={loading2FA}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                    twoFAEnabled ? "bg-green-500" : "bg-gray-300"
                  } ${loading2FA ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      twoFAEnabled ? "translate-x-5" : ""
                    }`}
                  ></span>
                </button>
              </div>

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}

      {showSearch && user && (
        <SearchUserModal onClose={() => setShowSearch(false)} />
      )}
    </header>
  );
}
