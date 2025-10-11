"use client";

import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";

type Friend = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  lastSeen: string;
  online: boolean;
};

export default function ListFriendPage() {
  const initialFriends: Friend[] = [
    {
      id: 1,
      name: "Leslie Alexander",
      email: "leslie.alexander@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "Project Manager",
      lastSeen: "3h ago",
      online: false,
    },
    {
      id: 2,
      name: "Michael Foster",
      email: "michael.foster@example.com",
      avatar:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "Team Lead",
      lastSeen: "2h ago",
      online: false,
    },
    {
      id: 3,
      name: "Dries Vincent",
      email: "dries.vincent@example.com",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "UX Designer",
      lastSeen: "",
      online: true,
    },
    {
      id: 4,
      name: "Lindsay Walton",
      email: "lindsay.walton@example.com",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "Front-end Developer",
      lastSeen: "1d ago",
      online: false,
    },
  ];

  const [friends] = useState<Friend[]>(initialFriends);
  const [searchTerm, setSearchTerm] = useState("");

  const handleClick = (friend: Friend) => {
    alert(`View details for ${friend.name}`);
  };

  // Hàm lọc bạn bè theo tên hoặc email
  const filteredFriends = friends.filter((friend) => {
    const term = searchTerm.toLowerCase();
    return (
      friend.name.toLowerCase().includes(term) ||
      friend.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#161853]">
        Friend List
      </h1>

      {/* Ô tìm kiếm */}
      <div className="relative mb-6 max-w-md mx-auto">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search friends by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#161853] focus:border-transparent"
        />
      </div>

      {/* Danh sách bạn bè */}
      <ul role="list" className="divide-y divide-gray-200">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <li
              key={friend.id}
              className="flex justify-between gap-x-6 py-5 items-center cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleClick(friend)}
            >
              <div className="flex min-w-0 gap-x-4 items-center">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="h-12 w-12 flex-none rounded-full bg-gray-50"
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-gray-900">
                    {friend.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {friend.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm text-gray-900">{friend.role}</p>
                  {friend.online ? (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      </div>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Last seen <time>{friend.lastSeen}</time>
                    </p>
                  )}
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">
            No friends found matching “{searchTerm}”
          </p>
        )}
      </ul>
    </div>
  );
}
