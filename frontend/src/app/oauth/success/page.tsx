"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuth();
  //const fetched = useRef(false); 

  useEffect(() => {

    const token = searchParams.get("token");

    if (!token) {
      router.push("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetch /users/me status:", res.status);

        if (!res.ok) throw new Error("Không lấy được thông tin người dùng");
        const user = await res.json();

        setAuth(user, token);

        setTimeout(() => {
          router.push("/");
        }, 300);
      } catch (err) {
        console.error("Lỗi khi xác thực Google:", err);
        router.push("/");
      }
    };

    fetchUser();
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold">Đang đăng nhập bằng Google...</h2>
      <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát ⏳</p>
    </div>
  );
}
