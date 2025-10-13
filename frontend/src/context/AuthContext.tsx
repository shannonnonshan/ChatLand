"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Socket, io } from "socket.io-client";

interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean; // check 2FA
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  socket: Socket | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const isAuthenticated = !!user && !!token;

  // Load auth from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      const parsedUser: User = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      initSocket(parsedUser.id, savedToken);
    }
  }, []);

  // Initialize Socket.IO
  const initSocket = (userId: number, authToken?: string) => {
    // disconnect old socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002", {
      auth: { token: authToken || token },
    });

    s.on("connect", () => {
      s.emit("register", userId); // thông báo server user đang online
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketRef.current = s;
    setSocket(s);
  };

  const setAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newToken);

    // Reconnect socket for new user
    initSocket(newUser.id, newToken);
  };

  const logout = () => {
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    // Clear auth state
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, setAuth, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
