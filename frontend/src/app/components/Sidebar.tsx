"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Home, Users, Mail, MessageSquareHeart, Shield  } from "lucide-react";
import SignInModal from "./(modal)/SignInModal";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // lấy user từ context
  const [showSignIn, setShowSignIn] = useState(false);

  // navItems động dựa trên user
  const navItems = useMemo(
    () => [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/friends", label: "Friends", icon: MessageSquareHeart },
      { href: "/inbox", label: "Inbox", icon: Mail },
      {
        href: user ? `/listfriend/${user.id}` : "/listfriend",
        label: "List Friends",
        icon: Users,
      },
    ],
    [user]
  );

  // click vào route cần đăng nhập
  const handleRestrictedClick = (href: string) => {
    if (!user) {
      setShowSignIn(true);
    } else {
      router.push(href);
    }
  };

  // check route active dựa vào pathname
  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            router.push("/signup");
          }}
          onSignIn={() => setShowSignIn(false)}
        />
      )}

      <aside className="fixed top-16 left-0 z-30 w-20 h-[calc(100vh-4rem)] flex flex-col items-center py-4 space-y-6 bg-gray-50 dark:bg-gray-800 border-r border-gray-200">
        {navItems.map((item) => {
          const active = isItemActive(item.href);

          // Nếu là mục cần đăng nhập
          if ((item.label === "Inbox" || item.label === "Friends") && !user) {
            return (
              <button
                key={item.href}
                onClick={() => handleRestrictedClick(item.href)}
                className={`relative group p-3 rounded-xl transition-colors ${
                  active
                    ? "bg-blue-900 text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition">
                  {item.label}
                </span>
              </button>
            );
          }

          // Link bình thường
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group p-3 rounded-xl transition-colors ${
                active
                  ? "bg-blue-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition">
                {item.label}
              </span>
            </Link>
          );
        })}
          {/* Nút Admin Dashboard chỉ hiển thị khi user là admin */}
        {user?.role === "admin" && (
          <Link
            href={`/admin/${user.id}`}
            className={`relative group p-3 rounded-xl transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <Shield className="w-5 h-5" />
            <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition">
              Admin
            </span>
          </Link>
        )}
      </aside>
    </>
  );
}
