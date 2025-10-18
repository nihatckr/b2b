"use client";

import { SignupForm } from "@/components/auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SignupPage() {
  const { data: session, status } = useSession();

  // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
  if (status === "authenticated" && session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}
