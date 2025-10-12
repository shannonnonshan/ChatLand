"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoIcon, CameraIcon, UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import SignInModal from "./components/(modal)/SignInModal";
import SignUpModal from "./components/(modal)/SignUpModal";
import { useAuth } from "@/context/AuthContext";

interface Author {
  id: number;
  name: string;
  avatar?: string;
  isFriend?: boolean;
  requestSent?: boolean;
}

interface Post {
  id: number;
  description: string;
  imageUrl?: string;
  createdAt: string;
  user: Author;
}

export default function Home() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<Author[]>([]);
  const [text, setText] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
    // ---------------- Common: Require Login ----------------
  const handleRequireLogin = () => {
    if (!currentUser) {
      setShowSignIn(true);
      return true;
    }
    else
    { console.log("User is logged in:", currentUser);
    return false;
    }
  };
  // ---------------- Fetch Posts ----------------
const handleCreatePost = async () => {
  if (!currentUser?.id) return alert("Bạn chưa đăng nhập!");

  if (!text.trim()) return alert("Vui lòng nhập nội dung trước khi đăng!");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: Number(currentUser.id), // ✅ ép kiểu number
        description: text,
      }),
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

  // ---------------- Fetch Friend Suggestions ----------------
useEffect(() => {
  const fetchSuggestions = async () => {
    if (!currentUser?.id) {
      return;
    }
    console.log("Fetching suggestions for userId:", currentUser);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/friend-suggestions/${currentUser.id}`
      );
      console.log("Fetch response:", res);
      if (!res.ok) throw new Error(res.statusText + " Failed to fetch friend suggestions");

      const data: Author[] = await res.json();
      setFriendSuggestions(data);
    } catch (err) {
      console.error("Error fetching friend suggestions:", err);
    }
  };

  fetchSuggestions();
}, [currentUser]);


  // ---------------- Add Friend ----------------
  const handleFriendAction = async (friendId: number, alreadySent: boolean) => {
  if (handleRequireLogin()) return;

  try {
    const endpoint = alreadySent
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/cancel`
      : `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/send`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser?.id,
        receiverId: friendId,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    // ✅ Cập nhật UI sau khi gửi hoặc hủy
    setFriendSuggestions((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, requestSent: !alreadySent } : f
      )
    );
  } catch (err) {
    console.error("Error handling friend request:", err);
    alert(alreadySent ? "Failed to cancel request!" : "Failed to send friend request!");
  }
};

  // ---------------- Toggle Friend (UI Only) ----------------
  const toggleFriend = (postId: number) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, user: { ...post.user, isFriend: !post.user.isFriend } }
          : post
      )
    );
  };

  return (
    <>
      {/* Sign In / Sign Up Modals */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}
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
          {/* Create Post Box */}
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
                  placeholder={currentUser ? "What's on your mind?" : "Đăng nhập để viết bài..."}
                  onClick={handleRequireLogin}
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
            <div className="text-right text-xs text-gray-500">{text.length}/100</div>
            {currentUser && (
              <button
                onClick={handleCreatePost}
                className="self-end bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Đăng bài
              </button>
            )}
          </div>

          {/* Friend Suggestions */}
          <div className="mt-6">
            <h2 className="text-gray-700 font-semibold mb-2 text-sm">Friend Suggestions</h2>
            <div className="flex overflow-x-auto gap-4 py-2">
              {friendSuggestions.length === 0 && (
                <span className="text-gray-400 text-xs">No suggestions available</span>
              )}
              {friendSuggestions.map((friend) => (
                <div
                  key={friend.id}
                  className="flex-shrink-0 w-40 bg-white p-3 rounded-lg shadow-sm flex flex-col items-center gap-2"
                >
                  <Image
                    src={friend.avatar || "/logo.png"}
                    alt={friend.id.toString()}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <p className="text-sm font-medium text-gray-900 text-center">{friend.name}</p>
                  
                  {/* Nếu đã gửi request thì hiển thị nút Cancel Request, nếu chưa gửi thì vẫn Add Friend */}
                  <button
                    onClick={() => handleFriendAction(friend.id, !!friend.requestSent)}
                    className={`mt-1 w-full text-xs py-1 rounded transition
                      ${friend.requestSent
                        ? "bg-gray-400 hover:bg-gray-500 text-white"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                  >
                    {friend.requestSent ? "Cancel Request" : "Add Friend"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                </div>
                <p className="text-gray-600 text-sm">{post.description}</p>
                {post.imageUrl && (
                  <div className="mt-2 w-full h-60 relative rounded overflow-hidden">
                    <Image src={post.imageUrl} alt="Post image" fill className="object-cover rounded" />
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Link href={`/profile/${post.user.id}`} className="flex items-center gap-2">
                    <Image
                      src={post.user.avatar || "/logo.png"}
                      alt={post.user.name}
                      width={32}
                      height={32}
                      className="rounded-full hover:opacity-80 transition"
                    />
                    <p className="font-semibold text-gray-900 hover:underline text-sm">{post.user.name}</p>
                  </Link>
                  {currentUser && (
                    post.user.isFriend ? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-medium">Friend</span>
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
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          .animate-pulse-slow { animation: pulse-slow 2s infinite; }
        `}</style>
      </div>
    </>
  );
}
