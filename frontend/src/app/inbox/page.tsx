"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

type Message = {
  id: string; // clientId hoặc DB id
  fromMe: boolean;
  text: string;
  timestamp: number;
  status?: "sending" | "sent" | "delivered" | "failed";
};

type Friend = {
  id: string; // phải map đúng với userId backend
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
};

export default function InboxPage() {
  const [userId] = useState("1"); // giả lập user hiện tại
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);

  /** 🌐 Fetch danh sách bạn bè */
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/${userId}`);
        const data: Friend[] = await res.json();
        setFriends(data.map(f => ({ ...f, messages: [] })));
      } catch (err) {
        console.error("Fetch friends error:", err);
      }
    };
    fetchFriends();
  }, [userId]);

  /** 🌐 Kết nối socket */
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002"}`);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("register", Number(userId));
    });

    socket.on("userList", (userIds: number[]) => {
      setFriends(prev => prev.map(f => ({ ...f, online: userIds.includes(Number(f.id)) })));
    });

    socket.on("privateMessage", (m: { id: string; from: string; text: string; timestamp: number }) => {
      setFriends(prev =>
        prev.map(f =>
          f.id === m.from
            ? { ...f, messages: [...f.messages, { id: m.id, fromMe: false, text: m.text, timestamp: m.timestamp, status: "delivered" }] }
            : f
        )
      );
      setActiveFriend(prev =>
        prev && prev.id === m.from
          ? { ...prev, messages: [...prev.messages, { id: m.id, fromMe: false, text: m.text, timestamp: m.timestamp, status: "delivered" }] }
          : prev
      );
    });

    socket.on("chatHistory", (messages: { id: string | number; senderId: number; content: string; createdAt: string | number }[]) => {
      setActiveFriend(prev =>
        prev
          ? {
              ...prev,
              messages: messages.map(m => ({
                id: m.id.toString(),
                fromMe: m.senderId === Number(userId),
                text: m.content,
                timestamp: new Date(m.createdAt).getTime(),
                status: "delivered",
              })),
            }
          : prev
      );
    });

    socket.on("messageStatus", ({ messageId, status }: { messageId: string; status: "sending" | "sent" | "delivered" | "failed" }) => {
      setFriends(prev =>
        prev.map(f => ({ ...f, messages: f.messages.map(m => (m.id === messageId ? { ...m, status } : m)) }))
      );
      setActiveFriend(prev =>
        prev ? { ...prev, messages: prev.messages.map(m => (m.id === messageId ? { ...m, status } : m)) } : prev
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  /** ✉️ Gửi tin nhắn */
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

    socketRef.current?.emit("privateMessage", {
      clientId: newMsg.id,
      from: Number(userId),
      to: Number(activeFriend.id),
      text: input,
    });

    setFriends(prev =>
      prev.map(f => (f.id === activeFriend.id ? { ...f, messages: [...f.messages, newMsg] } : f))
    );
    setActiveFriend(prev => (prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev));
    setInput("");
  };

  /** ⬇️ Mở inbox với bạn bè */
  const openInbox = (friend: Friend) => {
    setActiveFriend(friend);
    socketRef.current?.emit("getHistory", { userAId: Number(userId), userBId: Number(friend.id) });
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-4rem)] border rounded-xl bg-white shadow">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-slate-50 p-4">
        <h2 className="font-semibold text-slate-700 mb-3">Active Friends</h2>
        <div className="space-y-2">
          {friends.map(f => (
            <div
              key={f.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeFriend?.id === f.id ? "bg-blue-100" : "hover:bg-slate-200"}`}
              onClick={() => openInbox(f)}
            >
              <div className="relative">
                <img src={f.avatar} className="h-10 w-10 rounded-full object-cover" />
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${f.online ? "bg-green-500" : "bg-gray-400"}`} />
              </div>
              <div>
                <p className="font-medium text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-500">{f.online ? "Online" : "Offline"}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Box */}
      <section className="flex-1 flex flex-col">
        {activeFriend ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <img src={activeFriend.avatar} className="h-8 w-8 rounded-full object-cover" />
              <h3 className="font-semibold text-slate-800">{activeFriend.name}</h3>
              <span className={`ml-2 h-2.5 w-2.5 rounded-full ${activeFriend.online ? "bg-green-500" : "bg-gray-400"}`} />
            </div>

            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3">
              {activeFriend.messages.length === 0 && <p className="text-center text-slate-400 text-sm">No messages yet</p>}
              {activeFriend.messages.map(m => (
                <div key={m.id} className={`flex w-full ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div className={`inline-block break-words whitespace-pre-wrap max-w-[40%] rounded-2xl px-3 py-2 text-sm shadow relative ${m.fromMe ? "bg-blue-500 text-white" : "bg-white text-slate-800"}`}>
                    <p className="leading-snug">{m.text}</p>
                    <div className={`flex items-center gap-2 mt-1 text-[10px] ${m.fromMe ? "text-blue-100 justify-end" : "text-slate-400 justify-start"}`}>
                      <span>{formatTime(m.timestamp)}</span>
                      {m.fromMe && <span>{m.status}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="border-t p-3 flex gap-2 bg-white">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Send</button>
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
