"use client";

import { LoginForm } from "@/components/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const cleanupDone = useRef(false);

  // If session-expired error, clear everything and show clean login
  useEffect(() => {
    if (error === "session-expired" && !cleanupDone.current) {
      cleanupDone.current = true;

      // Clear server-side session (fire and forget)
      fetch("/api/auth/clear-session", { method: "POST" }).catch(() => {});

      // Clear ALL cookies
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        // Delete for all paths and domains
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      });

      // Clear storage
      sessionStorage.clear();
      localStorage.clear();

      // Clean URL without reload to prevent loop
      window.history.replaceState({}, "", "/auth/login");
    }
  }, [error]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ProtexFlow
        </a>
        {error === "session-expired" && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
            ⚠️ Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
