"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ dùng context để lấy user

type Notification = {
  id: number;
  userId: number;
  senderId?: number;
  type: string; // ví dụ: "FRIEND_REQUEST", "FRIEND_ACCEPTED"
  title: string;
  content?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    avatar?: string | null;
  };
};

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { sender, title, content, createdAt, type, userId } = notification;
  const router = useRouter();

  // ✅ Xử lý khi click thông báo
  const handleClick = () => {
    if (type === "FRIEND_REQUEST") {
      router.push(`/listfriend/${userId}`); // → trang danh sách lời mời
    } else if (type === "FRIEND_ACCEPTED") {
      router.push(`/inbox`); // → trang nhắn tin
    } else if (notification.link) {
      router.push(notification.link); // fallback nếu có link tuỳ chỉnh
    }
  };

  return (
    <div
      onClick={handleClick}
      className="w-full max-w-md p-4 mb-4 text-gray-900 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      role="alert"
    >
      <div className="flex items-center mb-3">
        <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
          New notification
        </span>
      </div>

      <div className="flex items-center">
        <div className="relative inline-block shrink-0">
          <Image
            width={48}
            height={48}
            className="w-12 h-12 rounded-full"
            src={sender?.avatar || "/logo.png"}
            alt={`${sender?.name || "User"} avatar`}
          />
        </div>
        <div className="ms-3 text-sm font-normal">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {sender?.name || "Someone"}
          </div>
          <div className="text-sm font-normal">{title}</div>
          {content && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{content}</div>
          )}
          <span className="text-xs font-medium text-blue-600 dark:text-blue-500">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const NotificationPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/notifications`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Response Error:", errorText);
          throw new Error("Failed to fetch notifications");
        }

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, id]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Notifications
      </h1>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : !user ? (
        <p className="text-gray-500 dark:text-gray-400">
          Please sign in to view notifications.
        </p>
      ) : notifications.length > 0 ? (
        notifications.map((n) => <NotificationCard key={n.id} notification={n} />)
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No notifications found.</p>
      )}
    </div>
  );
};

export default NotificationPage;
