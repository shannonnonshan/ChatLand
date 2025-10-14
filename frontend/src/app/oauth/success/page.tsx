import { Suspense } from "react";
import OAuthClient from "@/app/components/OAuthClient";

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold">Đang xử lý...</h2>
        </div>
      }
    >
      <OAuthClient />
    </Suspense>
  );
}
