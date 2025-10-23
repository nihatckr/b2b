"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignupForm } from "../../../components/auth";

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}
