"use client";

import { CardWrapper } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <CardWrapper
          headerLabel="Üye Ol"
          backButtonLabel="Zaten hesabınız var mı? Giriş yapın"
          backButtonHref="/auth/login"
        >
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Üyelik formu şu anda geliştirme aşamasındadır.
            </p>
            <p className="text-sm text-muted-foreground">
              Lütfen sistem yöneticinizle iletişime geçin.
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/auth/login">Giriş Sayfasına Dön</Link>
            </Button>
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}
