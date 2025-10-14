"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserSearchResult = {
  id: number;
  name: string;
  avatar?: string | null;
  role: string;
};

type Props = {
  onClose: () => void;
};

export default function SearchUserModal({ onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: query,
            currentUserId: user?.id
          }),
        });
        const data: UserSearchResult[] = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, user?.id]);

  const handleAddFriend = async (targetId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user?.id, receiverId: targetId }),
      });
      alert("Friend request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search Users</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-3 py-1 rounded-lg"
          >
            X
          </button>
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-3 text-lg border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Results */}
        {loading && <div className="text-gray-500 mb-2">Searching...</div>}

        <ul className="space-y-3 overflow-auto flex-1">
          {results.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  router.push(`/profile/${u.id}`);
                  onClose();
                }}
              >
                <Image
                  src={u.avatar || '/logo.png'}
                  alt={u.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-medium">{u.name}</span>
              </div>
              <button
                onClick={() => handleAddFriend(u.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Friend
              </button>
            </li>
          ))}
          {results.length === 0 && !loading && <li className="text-gray-500">No results</li>}
        </ul>
      </div>
    </div>
  );
}
