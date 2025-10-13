"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SendHorizonal, CheckCheck, Check, Layers2 } from "lucide-react";
import { useChat, Friend, Message } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import AudioRecorder from "../components/AudioRecoder";
import AudioMessage from "../components/AudioMessage";
import { formatTime } from "@/utils/formatTime";
import { span } from "framer-motion/client";

export default function InboxPage() {
  const { user } = useAuth();
  const { friends, activeFriend, openChat, sendMessage, socket } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeFriend?.messages]);

  const handleSummarize = async () => {
  if (!activeFriend) return;

  // Lấy tin chưa đọc
  const unreadMessages = activeFriend.messages
    .filter((m) => !m.fromMe && !m.seen)
    .map((m) => m.text)
    .join("\n");

  if (!unreadMessages.trim()) {
    setSummary("Không có tin nhắn chưa đọc nào để tóm tắt 💤");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: unreadMessages }),
    });

    if (!res.ok) {
      setSummary(" Lỗi máy chủ khi tóm tắt nội dung");
      return;
    }

    const data = await res.json();
    const summaryText = data?.summary?.trim();

    if (summaryText) {
      setSummary(` ${summaryText}`);
    } else {
      setSummary("🤔 Không có nội dung nào để tóm tắt hoặc AI không hiểu được tin nhắn này.");
    }
  } catch (err) {
    console.error("Summarize error:", err);
    setSummary("❌ Lỗi kết nối khi tóm tắt nội dung");
  }
};

    /** Gửi tin nhắn text */
    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeFriend || !input.trim()) return;
      sendMessage(String(activeFriend.id), input.trim());
      setInput("");
    };

  /** Gửi tin nhắn voice */
  const handleVoiceFinish = async ({ id, audio }: { id: string; audio: Blob }) => {
  if (!activeFriend) return;

    const file = new File([audio], "voice-message.webm", { type: "audio/webm" });
    const audioURL = URL.createObjectURL(file);

    // Gửi audio qua server (upload trước nếu cần)
    sendMessage(String(activeFriend.id), "[Voice message 🎧]", "audio", audioURL);
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;

    if (!nearBottom || !activeFriend || !socket || !user?.id) return;

    const lastIncoming = [...activeFriend.messages]
      .reverse()
      .find((m) => !m.fromMe && !m.seen);

    if (!lastIncoming) return;

    socket.emit("markAsSeen", {
      userId: user.id,
      friendId: Number(activeFriend.id),
    });
  };
  useEffect(() => {
    setSummary(null);
  }, [activeFriend?.id]);
  useEffect(() => {
    if (!activeFriend || !chatBoxRef.current) return;

    const container = chatBoxRef.current;

    // Tìm index tin chưa đọc đầu tiên (không phải của mình)
    const firstUnreadIndex = activeFriend.messages.findIndex(
      (m) => !m.fromMe && !m.seen
    );

    if (firstUnreadIndex === -1) {
      // Nếu không có tin chưa đọc => scroll xuống cuối như bình thường
      container.scrollTop = container.scrollHeight;
      return;
    }

    // Tìm element của tin chưa đọc đầu tiên
    const targetEl = container.querySelector(
      `[data-message-index="${firstUnreadIndex}"]`
    ) as HTMLElement | null;

    if (targetEl) {
      const offsetTop = targetEl.offsetTop - container.clientHeight / 4;
      container.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  }, [activeFriend]);
  /** Component bạn bè sidebar */
  const FriendItem = ({ friend }: { friend: Friend }) => {
    const hasUnread = friend.messages.some((m) => !m.fromMe && !m.seen);
    return (
      <div
        onClick={() => openChat(friend)}
        className={`flex flex-col p-2 rounded-lg cursor-pointer transition ${
          activeFriend?.id === friend.id
            ? "bg-blue-100"
            : "hover:bg-slate-200"
        }`}
      >
        <div className="flex items-center gap-3 min-h-[56px]">
          {/* Avatar + trạng thái */}
          <div className="relative flex-shrink-0">
            <Image
              src={friend.avatar || "/logo.png"}
              alt={friend.name}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10 flex-shrink-0"
            />
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                friend.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          {/* Tên + tin nhắn cuối */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 truncate">{friend.name}</p>
            {friend.lastMessage ? (
              <p
                className={`text-xs truncate ${
                  hasUnread ? "text-blue-500 font-medium" : "text-slate-500"
                }`}
              >
                {friend.lastMessage.text}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {friend.online ? "Online" : "Offline"}
              </p>
            )}
          </div>

          {/* Thời gian */}
          {friend.lastMessage && (
            <span className="text-xs text-slate-400 flex-shrink-0 self-start">
              {formatTime(friend.lastMessage.timestamp)}
            </span>
          )}
        </div>

      </div>
    );
  };

  const onlineFriends = friends.filter(f => f.online);
  const conversationFriends = friends
  .filter(f => f.messages.length > 0)
  .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));


  return (
    <>
      {/* Top avatar bar */}
      <div className="flex gap-2 overflow-x-auto border-b p-2 bg-slate-100">
        {friends.slice(0, 20).map(f => (
          <div
            key={f.id}
            onClick={() => openChat(f)}
            className={`flex flex-col items-center cursor-pointer transition p-1 rounded ${
              activeFriend?.id === f.id ? "bg-blue-200" : "hover:bg-slate-200"
            }`}
          >
            <div className="relative">
              <Image
                src={f.avatar || "/logo.png"}
                alt={f.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  f.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-xs text-slate-700 truncate w-12 text-center">
              {f.name}
            </p>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="flex h-[calc(100vh-4rem)] border rounded-xl bg-white shadow">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-slate-50 p-4 flex flex-col">
          {/* <h2 className="font-semibold text-slate-700 mb-3">Friends Online</h2>
          <div className="space-y-2 overflow-y-auto flex-1">
            {onlineFriends.map(f => (
              <FriendItem key={f.id} friend={f} />
            ))}
          </div> */}

          <h2 className="font-semibold text-slate-700 mt-4 mb-3">
            Conversations
          </h2>
          <div className="space-y-2 overflow-y-auto flex-1">
            {conversationFriends.map(f => (
              <FriendItem key={f.id} friend={f} />
            ))}
          </div>
        </aside>

        {/* Chat Box */}
        <section className="flex-1 flex flex-col">
          {activeFriend ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Image
                  src={activeFriend.avatar || "/logo.png"}
                  alt={activeFriend.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <h3 className="font-semibold text-slate-800">
                  {activeFriend.name}
                </h3>
                <span
                  className={`ml-2 h-2.5 w-2.5 rounded-full ${
                    activeFriend.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>

              {/* Messages */}
              <div
                  ref={chatBoxRef}
                  className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3"
                  id="chat-scroll-box"
                  onScroll={handleScroll}
                >
                {activeFriend.messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">
                    No messages yet
                  </p>
                ) : (
                  activeFriend.messages.map((m,idx) => (
                    
                    <div
                      key={m.id}
                      data-message-index={idx}
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
                      >
                        {m.type === "audio" && m.mediaUrl ? (
                          <AudioMessage audioUrl={m.mediaUrl} />
                        ) : (
                          <p className="leading-snug">{m.text}</p>
                        )}

                        <div
                          className={`flex items-center gap-2 mt-1 text-[10px] ${
                            m.fromMe
                              ? "text-blue-100 justify-end"
                              : "text-slate-400 justify-start"
                          }`}
                        >
                          <span>{formatTime(m.timestamp)}</span>
                          {m.fromMe && (
                            <>
                              {m.seen ? (
                                <CheckCheck
                                  size={12}
                                  className="text-blue-200"
                                />
                              ) : (
                                <Check size={12} />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {summary && (
                  <div className="relative bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mx-4 mb-2 rounded-lg text-sm">
                    <button
                      onClick={() => setSummary(null)}
                      className="absolute top-1 right-2 text-yellow-700 hover:text-red-500 font-bold"
                      title="Close"
                    >
                      ×
                    </button>
                    {summary}
                  </div>
                )}

              {/* Input */}
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

                <AudioRecorder onFinish={handleVoiceFinish} />

                <button
                  type="button"
                  onClick={handleSummarize}
                  className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center"
                  title="Summarize unread messages"
                >
                  <Layers2 size={18}/>
                </button>

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                  title="Send Message"
                >
                  <SendHorizonal size={18} />
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
    </>
  );
}
