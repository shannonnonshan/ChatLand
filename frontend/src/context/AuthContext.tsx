"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Socket, io } from "socket.io-client";

interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  socket: Socket | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      initSocket(parsedUser.id);
    }
  }, []);

  // Initialize Socket.IO
  const initSocket = (userId: number) => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002");
    s.on("connect", () => {
      s.emit("register", userId); // thông báo server user đang online
    });
    setSocket(s);
  };

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    // Reconnect socket for new user
    if (socket) {
      socket.disconnect();
    }
    initSocket(user.id);
  };

  const logout = () => {
    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    // Clear auth state
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Reset app-level state if needed (e.g., friends, active chat)
    // You can also trigger a global state reset here

    // Redirect to home
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
