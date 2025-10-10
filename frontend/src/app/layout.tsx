import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import NoDarkMode from "@/app/components/darkTheme";import { AuthProvider } from "@/context/AuthContext";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatLand",
  description: "Chat application for real-time messaging",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <body className={`${raleway.variable} font-sans antialiased`}>
        {/* ✅ Đưa AuthProvider ra ngoài để bọc toàn bộ UI */}
        <AuthProvider>
          <Topbar />
          <Sidebar />
        <NoDarkMode />
          <div className="pt-16 sm:ml-20 p-4">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
