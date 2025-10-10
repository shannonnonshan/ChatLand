"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";

export type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
  status?: "sending" | "sent" | "delivered" | "failed";
  audioUrl?: string;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
  lastMessage?: Message;
};

type BackendMessage = {
  id: string | number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string | number;
};

type Conversation = {
  friend: Friend;
  messages: BackendMessage[];
  lastMessage?: BackendMessage;
};

type UseChatReturn = {
  friends: Friend[];
  activeFriend: Friend | null;
  openChat: (friend: Friend) => void;
  sendMessage: (friendId: string, text: string) => void;
  resetChat: () => void;
};

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Convert backend message → frontend message
  const toMessage = (m: BackendMessage): Message => ({
    id: m.id.toString(),
    fromMe: m.senderId === user?.id,
    text: m.content,
    timestamp: new Date(m.createdAt).getTime(),
    status: "delivered",
  });

  // Fetch friends + conversations on mount
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const friendsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/friends`);
        const friendsData: Friend[] = await friendsRes.json();

        const convRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/conversations`);
        const convData: Conversation[] = await convRes.json();

        // Merge conversations into friends
        const merged = friendsData.map(f => {
          const conv = convData.find(c => c.friend.id === f.id);
          const convMessages = conv?.messages.map(toMessage) || [];
          return {
            ...f,
            messages: convMessages,
            lastMessage: convMessages[convMessages.length - 1],
          };
        });

        setFriends(merged);
      } catch (err) {
        console.error("Error fetching chat data:", err);
      }
    };

    fetchData();
  }, [user]);

  // Setup Socket.IO
  useEffect(() => {
    if (!user) return;

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002"}`);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", user.id);
    });

    socket.on("userList", (userIds: number[]) => {
      setFriends(prev => prev.map(f => ({ ...f, online: userIds.includes(Number(f.id)) })));
    });

    socket.on("privateMessage", (m: { id: string; from: string; text: string; timestamp: number }) => {
      const msg: Message = { id: m.id, fromMe: false, text: m.text, timestamp: m.timestamp, status: "delivered" };
      setFriends(prev => prev.map(f => f.id === m.from ? { ...f, messages: [...f.messages, msg], lastMessage: msg } : f));
      if (activeFriend?.id === m.from) {
        setActiveFriend(prev => prev ? { ...prev, messages: [...prev.messages, msg], lastMessage: msg } : prev);
      }
    });

    socket.on("chatHistory", (messages: BackendMessage[]) => {
      const msgs = messages.map(toMessage).sort((a, b) => a.timestamp - b.timestamp);
      if (activeFriend) {
        setActiveFriend(prev => prev ? { ...prev, messages: msgs, lastMessage: msgs[msgs.length - 1] } : prev);
      }
    });

    socket.on("messageStatus", ({ messageId, status }: { messageId: string; status: "sending" | "sent" | "delivered" | "failed" }) => {
      setFriends(prev => prev.map(f => ({
        ...f,
        messages: f.messages.map(m => m.id === messageId ? { ...m, status } : m),
        lastMessage: f.lastMessage?.id === messageId ? { ...f.lastMessage, status } : f.lastMessage,
      })));
      if (activeFriend) {
        setActiveFriend(prev => prev ? {
          ...prev,
          messages: prev.messages.map(m => m.id === messageId ? { ...m, status } : m),
          lastMessage: prev.lastMessage?.id === messageId ? { ...prev.lastMessage, status } : prev.lastMessage,
        } : prev);
      }
    });

    // Cleanup function (correct type)
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, activeFriend]);

  // Open chat with a friend
  const openChat = (friend: Friend) => {
    setActiveFriend(friend);
    socketRef.current?.emit("getHistory", { userAId: user?.id, userBId: Number(friend.id) });
  };

  // Send message
  const sendMessage = (friendId: string, text: string) => {
    if (!user || !socketRef.current) return;
    const msg: Message = { id: uuidv4(), fromMe: true, text, timestamp: Date.now(), status: "sending" };
    socketRef.current.emit("privateMessage", { clientId: msg.id, from: user.id, to: Number(friendId), text });

    setFriends(prev => prev.map(f => f.id === friendId ? { ...f, messages: [...f.messages, msg], lastMessage: msg } : f));
    if (activeFriend?.id === friendId) setActiveFriend(prev => prev ? { ...prev, messages: [...prev.messages, msg], lastMessage: msg } : prev);
  };

  // Reset chat (logout)
  const resetChat = () => {
    setFriends([]);
    setActiveFriend(null);
    socketRef.current?.disconnect();
    socketRef.current = null;
  };

  return { friends, activeFriend, openChat, sendMessage, resetChat };
}
