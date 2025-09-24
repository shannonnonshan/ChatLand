"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Home, Users, Mail, Megaphone } from "lucide-react";

const navItems = [
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/listfriend", label: "Friends", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* SIDEBAR */}
      <aside className="fixed top-16 left-0 z-30 w-20 h-[calc(100vh-4rem)] flex flex-col items-center py-4 space-y-6 bg-gray-50 dark:bg-gray-800 border-r border-gray-200">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group p-3 rounded-xl transition-colors ${
                isActive
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
      </aside>
    </>
  );
}
