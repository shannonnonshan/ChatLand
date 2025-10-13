"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoIcon, CameraIcon, XMarkIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
  description?: string;
  imageUrl: string;
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

  const [imageToPost, setImageToPost] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ---------------- Helper: Base64 → File ----------------
  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  // ---------------- Common ----------------
  const handleRequireLogin = () => {
    if (!currentUser) {
      setShowSignIn(true);
      return true;
    }
    return false;
  };

  // ---------------- Fetch Posts ----------------
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { fetchPosts(); }, []);

  // ---------------- Fetch Friend Suggestions ----------------
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser?.id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/friend-suggestions/${currentUser.id}`);
        if (!res.ok) throw new Error("Failed to fetch friend suggestions");
        const data: Author[] = await res.json();
        setFriendSuggestions(data);
      } catch (err) { console.error(err); }
    };
    fetchSuggestions();
  }, [currentUser]);

  // ---------------- Camera Functions ----------------
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return alert("Camera not supported");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error("Cannot access camera", err);
      alert("Cannot access camera");
    }
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImageToPost(canvas.toDataURL("image/png"));
      stopCamera();
      setShowCameraModal(false);
      setShowImageModal(true);
    }
  };

  // ---------------- Upload local image ----------------
  const handleUploadLocalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageToPost(reader.result as string);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- Create/Edit Post ----------------
  const handleCreatePost = async () => {
    if (!currentUser?.id) return alert("Bạn chưa đăng nhập!");
    if (!imageToPost) return alert("Bạn phải chọn ảnh hoặc chụp ảnh!");

    try {
      const endpoint = editingPostId
        ? `${process.env.NEXT_PUBLIC_API_URL}/posts/${editingPostId}/edit`
        : `${process.env.NEXT_PUBLIC_API_URL}/posts/create`;

      const formData = new FormData();
      formData.append("userId", String(currentUser.id));
      if (text.trim()) formData.append("description", text);
      const file = dataURLtoFile(imageToPost, "post.png");
      formData.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/create`, {
        method: "POST",
        body: formData,
      });


      if (!res.ok) {
        const errText = await res.text();
        console.error("Server response error:", errText);
        throw new Error("Failed to create/edit post: " + errText);
      }

      const newPost: Post = await res.json();

      if (editingPostId) {
        setPosts((prev) => prev.map((p) => p.id === editingPostId ? newPost : p));
        setEditingPostId(null);
      } else {
        setPosts((prev) => [newPost, ...prev]);
      }

      setText("");
      setImageToPost(null);
      setShowImageModal(false);
    } catch (err) {
      console.error(err);
      alert("Đăng bài thất bại!");
    }
  };

  // ---------------- Edit / Delete ----------------
  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setText(post.description || "");
    if (post.imageUrl) setImageToPost(post.imageUrl);
    setShowImageModal(true);
  };
  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài này?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) { console.error(err); alert("Xóa bài thất bại!"); }
  };

  // ---------------- Friend ----------------
  const handleFriendAction = async (friendId: number, alreadySent: boolean) => {
    if (handleRequireLogin()) return;
    try {
      const endpoint = alreadySent
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/cancel`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/send`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUser?.id, receiverId: friendId }),
      });

      if (!res.ok) throw new Error(await res.text());

      setFriendSuggestions((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, requestSent: !alreadySent } : f))
      );
    } catch (err) {
      console.error(err);
      alert(alreadySent ? "Failed to cancel request!" : "Failed to send friend request!");
    }
  };

  return (
    <>
      {/* Sign In / Sign Up Modals */}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} />}
      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onSwitchToLogin={() => { setShowSignUp(false); setShowSignIn(true); }} />}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg relative w-[80%] max-w-lg h-[500px] overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow-lg hover:bg-yellow-300 transition transform hover:scale-110">
              <CameraIcon className="h-8 w-8 text-white" />
            </button>
            <button onClick={() => { stopCamera(); setShowCameraModal(false); }} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600">
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full flex flex-col gap-3">
            {imageToPost && <div className="w-full h-64 relative rounded overflow-hidden"><Image src={imageToPost} alt="Preview" fill className="object-cover rounded" /></div>}
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết gì đó (không bắt buộc)" className="w-full p-2 border rounded resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowImageModal(false); setImageToPost(null); setEditingPostId(null); }} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleCreatePost} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Create Post Box */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <div className="flex items-start gap-3 w-full">
              <Image src={currentUser?.avatarUrl || "/logo.png"} alt="Avatar" width={48} height={48} className="rounded-full" />
              <div className="flex-1 flex flex-row gap-2 items-start">
                <textarea value={text} maxLength={100} placeholder={currentUser ? "Chọn ảnh rồi viết gì đó..." : "Đăng nhập để viết bài..."} onClick={handleRequireLogin} onChange={(e) => setText(e.target.value)} disabled={!currentUser} className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
                <div className="flex gap-2 ml-2 mt-1">
                  {/* Upload Local */}
                  <input type="file" accept="image/*" onChange={handleUploadLocalImage} className="hidden" id="upload-image-input" />
                  <label htmlFor="upload-image-input" className="w-10 h-10 flex items-center justify-center bg-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-300"><PhotoIcon className="h-5 w-5 text-gray-800" /></label>

                  {/* Camera */}
                  <button onClick={() => { if (handleRequireLogin()) return; setShowCameraModal(true); startCamera(); }} className="w-10 h-10 flex items-center justify-center bg-yellow-200 rounded-lg hover:bg-yellow-300 transition transform hover:scale-110 hover:shadow-md animate-pulse-slow">
                    <CameraIcon className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">{text.length}/100</div>
            {currentUser && imageToPost && <button onClick={handleCreatePost} className="self-end bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition">Đăng bài</button>}
          </div>

          {/* Friend Suggestions */}
          <div className="mt-6">
            <h2 className="text-gray-700 font-semibold mb-2 text-sm">Friend Suggestions</h2>
            <div className="flex overflow-x-auto gap-4 py-2">
              {friendSuggestions.length === 0 && <span className="text-gray-400 text-xs">No suggestions available</span>}
              {friendSuggestions.map((friend) => (
                <div key={friend.id} className="flex-shrink-0 w-40 bg-white p-3 rounded-lg shadow-sm flex flex-col items-center gap-2">
                  <Image src={friend.avatar || "/logo.png"} alt={friend.id.toString()} width={48} height={48} className="rounded-full" />
                  <p className="text-sm font-medium text-gray-900 text-center">{friend.name}</p>
                  <button onClick={() => handleFriendAction(friend.id, !!friend.requestSent)} className={`mt-1 w-full text-xs py-1 rounded transition ${friend.requestSent ? "bg-gray-400 hover:bg-gray-500 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}>
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
                   {new Date(post.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  {currentUser?.id === post.user.id && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPost(post)} className="p-1 hover:bg-gray-200 rounded"><PencilSquareIcon className="h-5 w-5 text-gray-600" /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-1 hover:bg-gray-200 rounded"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                    </div>
                  )}
                </div>
                {post.description && <p className="text-gray-600 text-sm">{post.description}</p>}
                {post.imageUrl && (
                  <div className="mt-2 w-full h-60 relative rounded overflow-hidden">
                    <Image
                      src={post.imageUrl?.startsWith('http') 
                          ? post.imageUrl 
                          : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
                      alt="Post image"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Link href={`/profile/${post.user.id}`} className="flex items-center gap-2">
                    <Image src={post.user.avatar || "/logo.png"} alt={post.user.name} width={32} height={32} className="rounded-full hover:opacity-80 transition" />
                    <p className="font-semibold text-gray-900 hover:underline text-sm">{post.user.name}</p>
                  </Link>
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
