"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Topbar from "./components/Topbar";

export default function ProtectedPage() {
  useProtectedRoute();

  return (
    <div>
      <Topbar />
      <h1 className="text-2xl font-bold p-4">This page is protected</h1>
    </div>
  );
}
