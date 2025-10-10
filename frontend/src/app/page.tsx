"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import SignInModal from "./components/(modal)/SignInModal";
import SignUpModal from "./components/(modal)/SignUpModal";
import { useAuth } from "@/context/AuthContext";

interface Author {
  id: number;
  name: string;
  avatar?: string;
  isFriend?: boolean;
}

interface Post {
  id: number;
  description: string;
  imageUrl?: string;
  createdAt: string;
  user: Author;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  // ✅ Dùng AuthContext thay vì localStorage
  const { user: currentUser } = useAuth();

  // Fetch posts từ backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        const formatted = data.map((p: Post) => ({
          ...p,
          user: { ...p.user, isFriend: false },
        }));
        setPosts(formatted);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // Toggle friend
  const toggleFriend = (id: number) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, user: { ...post.user, isFriend: !post.user.isFriend } }
          : post
      )
    );
  };

  // ✅ Kiểm tra login trước khi thao tác
  const handleRequireLogin = () => {
    if (!currentUser) {
      setShowSignIn(true);
      return true;
    }
    return false;
  };

  // ✅ Đăng bài mới
  const handleCreatePost = async () => {
    if (handleRequireLogin()) return;
    if (!text.trim()) return alert("Vui lòng nhập nội dung trước khi đăng!");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id, description: text }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setText("");
    } catch (err) {
      console.error(err);
      alert("Đăng bài thất bại!");
    }
  };

  return (
    <>
      {/* SignIn Modal */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}

      {/* SignUp Modal */}
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}

      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Post Status Box */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <div className="flex items-start gap-3 w-full">
              <Image
                src={currentUser?.avatarUrl || "/logo.png"}
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1 flex flex-row gap-2 items-start">
                <textarea
                  value={text}
                  maxLength={100}
                  placeholder={
                    currentUser
                      ? "What's on your mind?"
                      : "Đăng nhập để viết bài..."
                  }
                  onClick={() => handleRequireLogin()}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!currentUser}
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <div className="flex gap-2 ml-2 mt-1">
                  <button
                    onClick={() => {
                      if (handleRequireLogin()) return;
                      alert("Upload ảnh — đang phát triển");
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-yellow-200 rounded-lg hover:bg-yellow-300 transition transform hover:scale-110 hover:shadow-md"
                    disabled={!currentUser}
                  >
                    <PhotoIcon className="h-5 w-5 text-gray-800" />
                  </button>

                  <button
                    onClick={() => {
                      if (handleRequireLogin()) return;
                      router.push("/camera");
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-yellow-200 rounded-lg hover:bg-yellow-300 transition transform hover:scale-110 hover:shadow-md animate-pulse-slow"
                    disabled={!currentUser}
                  >
                    <CameraIcon className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              {text.length}/100
            </div>

            {currentUser && (
              <button
                onClick={handleCreatePost}
                className="self-end bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Đăng bài
              </button>
            )}
          </div>

          {/* Posts List */}
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                </div>
                <p className="text-gray-600 text-sm">{post.description}</p>
                {post.imageUrl && (
                  <div className="mt-2 w-full h-60 relative rounded overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={post.user.avatar || "/logo.png"}
                      alt={post.user.name}
                      width={32}
                      height={32}
                      className="rounded-full hover:opacity-80 transition"
                    />
                    <p className="font-semibold text-gray-900 hover:underline text-sm">
                      {post.user.name}
                    </p>
                  </Link>

                  {currentUser && (
                    post.user.isFriend ? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        Friend
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleFriend(post.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition"
                      >
                        Add Friend
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s infinite;
          }
        `}</style>
      </div>
    </>
  );
}
