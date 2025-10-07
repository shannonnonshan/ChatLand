"use client";

import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
  status?: "sending" | "sent" | "delivered";
};

type Friend = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
};

let socket: Socket;

export default function InboxPage() {
  const [userId] = useState("user1");
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: "user2",
      name: "Tania",
      avatar: "https://docs.material-tailwind.com/img/face-1.jpg",
      online: false,
      messages: [],
    },
    {
      id: "user3",
      name: "Alexander",
      avatar: "https://docs.material-tailwind.com/img/face-2.jpg",
      online: false,
      messages: [],
    },
  ]);

  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("register", userId);
    });

    socket.on("userList", (userIds: string[]) => {
      setFriends((prev) =>
        prev.map((f) => ({ ...f, online: userIds.includes(f.id) }))
      );
    });

    // Nhận tin nhắn mới
    socket.on(
      "privateMessage",
      ({ id, from, text, timestamp }: { id: string; from: string; text: string; timestamp: number }) => {
        setFriends((prev) =>
          prev.map((f) =>
            f.id === from
              ? {
                  ...f,
                  messages: [
                    ...f.messages,
                    { id, fromMe: false, text, timestamp, status: "delivered" },
                  ],
                }
              : f
          )
        );

        setActiveFriend((prev) =>
          prev && prev.id === from
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  { id, fromMe: false, text, timestamp, status: "delivered" },
                ],
              }
            : prev
        );
      }
    );

    // Cập nhật trạng thái tin nhắn (sent / delivered)
    socket.on("messageStatus", ({ messageId, status }) => {
      setFriends((prev) =>
        prev.map((f) => ({
          ...f,
          messages: f.messages.map((m) =>
            m.id === messageId ? { ...m, status } : m
          ),
        }))
      );

      setActiveFriend((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === messageId ? { ...m, status } : m
              ),
            }
          : prev
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Gửi tin nhắn
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeFriend) return;

    const newMsg: Message = {
      id: uuidv4(),
      fromMe: true,
      text: input,
      timestamp: Date.now(),
      status: "sending",
    };

    // Emit tới server
    socket.emit("privateMessage", {
      ...newMsg,
      from: userId,
      to: activeFriend.id,
    });

    // Cập nhật UI ngay
    setFriends((prev) =>
      prev.map((f) =>
        f.id === activeFriend.id
          ? { ...f, messages: [...f.messages, newMsg] }
          : f
      )
    );

    setActiveFriend((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
    );

    setInput("");
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-4rem)] border rounded-xl bg-white shadow">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-slate-50 p-4">
        <h2 className="font-semibold text-slate-700 mb-3">Active Friends</h2>
        <div className="space-y-2">
          {friends.map((f) => (
            <div
              key={f.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                activeFriend?.id === f.id ? "bg-blue-100" : "hover:bg-slate-200"
              }`}
              onClick={() => setActiveFriend(f)}
            >
              <div className="relative">
                <img
                  src={f.avatar}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    f.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-500">
                  {f.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat box */}
      <section className="flex-1 flex flex-col">
        {activeFriend ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <img
                src={activeFriend.avatar}
                className="h-8 w-8 rounded-full object-cover"
              />
              <h3 className="font-semibold text-slate-800">
                {activeFriend.name}
              </h3>
              <span
                className={`ml-2 h-2.5 w-2.5 rounded-full ${
                  activeFriend.online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>

            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3">
              {activeFriend.messages.length === 0 && (
                <p className="text-center text-slate-400 text-sm">
                  No messages yet
                </p>
              )}
              {activeFriend.messages.map((m, i) => (
              <div
                key={i}
                className={`flex w-full ${
                  m.fromMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`inline-block break-words whitespace-pre-wrap max-w-[60%] rounded-2xl px-3 py-2 text-sm shadow relative ${
                    m.fromMe
                      ? "bg-blue-500 text-white"
                      : "bg-white text-slate-800"
                  }`}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  <p className="leading-snug">{m.text}</p>

                  <div
                    className={`flex items-center gap-2 mt-1 text-[10px] ${
                      m.fromMe ? "text-blue-100 justify-end" : "text-slate-400 justify-start"
                    }`}
                  >
                    <span>{formatTime(m.timestamp)}</span>
                    {m.fromMe && (
                      <span>
                        {m.status === "sending"
                          ? "Đang gửi..."
                          : m.status === "sent"
                          ? "Đã gửi"
                          : m.status === "delivered"
                          ? "Đã nhận ✅"
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>

            <form
              onSubmit={handleSend}
              className="border-t p-3 flex gap-2 bg-white"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <p>Select a friend to chat 💬</p>
          </div>
        )}
      </section>
    </div>
  );
}
