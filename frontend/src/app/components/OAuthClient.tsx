"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OAuthClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuth();
  const fetched = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không lấy được thông tin người dùng");
        const user = await res.json();
        setAuth(user, token);
        router.replace("/");
      } catch (err) {
        console.error("Lỗi khi xác thực Google:", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams, setAuth, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold">Đang đăng nhập bằng Google...</h2>
        <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát ⏳</p>
      </div>
    );
  }

  return null; // redirect xong sẽ không render gì
}
