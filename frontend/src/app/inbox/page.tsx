"use client";

import { useState } from "react";

type Friend = {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  messages: { fromMe: boolean; text: string }[];
};

export default function InboxPage() {
  const allFriends: Friend[] = [
    {
      id: 1,
      name: "Tania",
      avatar: "https://docs.material-tailwind.com/img/face-1.jpg",
      online: true,
      messages: [
        { fromMe: false, text: "Hey, how are you?" },
        { fromMe: true, text: "I'm good thanks 😄" },
      ],
    },
    {
      id: 2,
      name: "Alexander",
      avatar: "https://docs.material-tailwind.com/img/face-2.jpg",
      online: false,
      messages: [{ fromMe: false, text: "Let's play later 🎮" }],
    },
    {
      id: 3,
      name: "Emma",
      avatar: "https://docs.material-tailwind.com/img/face-3.jpg",
      online: true,
      messages: [],
    },
    {
      id: 4,
      name: "Sophia",
      avatar: "https://docs.material-tailwind.com/img/face-4.jpg",
      online: true,
      messages: [],
    },
    {
      id: 5,
      name: "Lucas",
      avatar: "https://docs.material-tailwind.com/img/face-5.jpg",
      online: false,
      messages: [],
    },
  ];

  const [inboxFriends, setInboxFriends] = useState<Friend[]>([
    allFriends[0],
    allFriends[1],
  ]);

  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [input, setInput] = useState("");

  const openInbox = (friend: Friend) => {
    setInboxFriends((prev) => {
      const exists = prev.find((f) => f.id === friend.id);
      if (exists) return prev;
      return [friend, ...prev];
    });
    setActiveFriend(friend);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeFriend) return;

    setInboxFriends((prev) =>
      prev.map((f) =>
        f.id === activeFriend.id
          ? { ...f, messages: [...f.messages, { fromMe: true, text: input }] }
          : f
      )
    );
    setActiveFriend((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, { fromMe: true, text: input }],
          }
        : null
    );
    setInput("");
  };

  const handleDelete = (id: number) => {
    setInboxFriends((prev) => prev.filter((f) => f.id !== id));
    if (activeFriend?.id === id) {
      setActiveFriend(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
      {/* Thanh bạn bè ngang */}
      <div className="flex gap-4 p-4 border-b border-slate-200 overflow-x-auto">
        {allFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => openInbox(friend)}
          >
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  friend.online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
            <span className="text-xs mt-1 text-slate-700">{friend.name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Danh sách inbox */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          <h2 className="px-4 py-3 text-lg font-semibold text-slate-700">
            Inbox
          </h2>
          <nav className="flex flex-col gap-1 px-2">
            {inboxFriends.map((friend) => (
              <div
                key={friend.id}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-200 transition ${
                  activeFriend?.id === friend.id ? "bg-slate-200" : ""
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setActiveFriend(friend)}
                >
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        friend.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="overflow-hidden">
                    <h6 className="font-medium text-slate-800">
                      {friend.name}
                    </h6>
                    <p className="truncate text-sm text-slate-500">
                      {friend.messages.at(-1)?.text || "No messages yet"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(friend.id)}
                  className="text-slate-400 hover:text-red-500 transition"
                  title="Xóa cuộc trò chuyện"
                >
                  🗑
                </button>
              </div>
            ))}
          </nav>
        </aside>

        {/* Hộp chat */}
        <section className="flex-1 flex flex-col">
          {activeFriend ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative">
                  <img
                    src={activeFriend.avatar}
                    alt={activeFriend.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      activeFriend.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>
                <h3 className="font-semibold text-slate-800">
                  {activeFriend.name}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3">
                {activeFriend.messages.length === 0 && (
                  <p className="text-center text-slate-400 text-sm">
                    No messages yet
                  </p>
                )}
                {activeFriend.messages.map((m, i) => (
  <div
    key={i}
    className={`max-w-[40%] rounded-lg p-3 text-sm shadow ${
      m.fromMe
        ? "ml-auto bg-blue-500 text-white"
        : "bg-white text-slate-800"
    }`}
  >
    {m.text}
  </div>
))}

              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-slate-200 bg-white p-3 flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              <p>Select a conversation 💬</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
