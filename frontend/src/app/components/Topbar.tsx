"use client";

import { useState } from "react";
import { Bell, Search, User } from "lucide-react";
import SignInModal from "./(modal)/SignInModal";
import SignUpModal from "./(modal)/SignUpModal";
import Image from "next/image";

export default function Topbar() {
  const [user, setUser] = useState<null | { 
    name: string; 
    email: string; 
    avatarUrl?: string 
  }>(null); // null = chưa đăng nhập
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={32} 
          height={32} 
          className="h-8 w-8 object-contain" 
        />
        <span className="text-xl font-bold text-black">Chat Land</span>
      </div>

      {/* Search + Bell + Avatar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-3 pr-8 py-1.5 rounded-md border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
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
              <Image
                src={user.avatarUrl}
                alt="avatar"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 mx-auto my-[7px] text-gray-600" />
            )}
          </button>

          {/* Menu user (nếu đã login) */}
          {user && showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setUser(null);
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

      {/* MODALS */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
          // onSignIn={(fakeUser: unknown) => {
          //   setUser(fakeUser);
          //   setShowSignIn(false);
          // }}
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
    </header>
  );
}
