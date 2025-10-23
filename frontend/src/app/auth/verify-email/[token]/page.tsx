"use client";

import { VerifyEmailDocument } from "@/__generated__/graphql";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "urql";
import {
  CardWrapper,
  FormError,
  FormSuccess,
} from "../../../../components/auth";
import { Button } from "../../../../components/ui/button";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const token = params.token as string;

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [, verifyEmailMutation] = useMutation(VerifyEmailDocument);

  useEffect(() => {
    const verifyEmail = async () => {
      const result = await verifyEmailMutation({ token });

      if (result.error) {
        setError(
          result.error.message ||
            "E-posta doğrulama başarısız oldu. Link geçersiz veya süresi dolmuş olabilir."
        );
        setIsVerifying(false);
        return;
      }

      if (result.data?.verifyEmail) {
        setSuccess("E-postanız başarıyla doğrulandı! Yönlendiriliyorsunuz...");
        setIsVerifying(false);

        // Eğer kullanıcı login ise, session'ı güncelle
        if (session?.user) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              emailVerified: true,
            },
          });

          // Login kullanıcıyı dashboard'a yönlendir
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          // Login değilse, login sayfasına yönlendir
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, router, session, updateSession, verifyEmailMutation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <CardWrapper
          headerLabel="E-posta Doğrulama"
          backButtonLabel="Giriş sayfasına dön"
          backButtonHref="/auth/login"
        >
          <div className="space-y-4">
            {/* Loading State */}
            {isVerifying && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  E-posta adresiniz doğrulanıyor...
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {!isVerifying && (
              <>
                <FormError message={error} />
                <FormSuccess message={success} />

                {/* Error State - Additional Actions */}
                {error && (
                  <div className="space-y-3 pt-4">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">
                        Olası sebepler:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Link süresi dolmuş olabilir (24 saat)</li>
                        <li>Link geçersiz veya zaten kullanılmış olabilir</li>
                        <li>E-posta adresi zaten doğrulanmış olabilir</li>
                      </ul>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link href="/auth/resend-verification">
                        Yeni Doğrulama Linki Gönder
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Redirect Info */}
                {success && (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      {session?.user
                        ? "2 saniye içinde anasayfaya yönlendirileceksiniz..."
                        : "3 saniye içinde giriş sayfasına yönlendirileceksiniz..."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}
