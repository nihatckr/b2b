"use client";

import { ResendVerificationEmailAuthDocument } from "@/__generated__/graphql";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/auth/form-error";
import { FormSuccess } from "@/components/auth/form-success";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "urql";

export default function ResendVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [{ fetching: isLoading }, resendEmailMutation] = useMutation(
    ResendVerificationEmailAuthDocument
  );

  // Eğer giriş yapmamışsa login'e yönlendir
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?message=login-required");
    }
  }, [status, router]);

  const handleResend = async () => {
    setError("");
    setSuccess("");

    const result = await resendEmailMutation({});

    if (result.error) {
      setError(result.error.message || "Doğrulama e-postası gönderilemedi.");
    } else if (result.data?.resendVerificationEmail) {
      setSuccess(
        "E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin."
      );
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-lg text-white">Yükleniyor...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

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
            {/* Description */}
            <div className="text-center mb-2">
              <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                E-posta adresinizi doğrulamak için yeni bir link gönderelim.
              </p>
            </div>

            {/* Info Box */}
            {!success && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm">
                  <strong>Not:</strong> Doğrulama linki 24 saat geçerlidir. Bu
                  süre içinde e-posta adresinizi doğrulamanız gerekmektedir.
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            <FormError message={error} />
            <FormSuccess message={success} />

            {/* Success Additional Info */}
            {success && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  💡 Spam/Gereksiz klasörünü kontrol etmeyi unutmayın!
                </p>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Doğrulama E-postası Gönder
                </>
              )}
            </Button>

            {/* Help Text */}
            <div className="pt-2">
              <p className="text-sm font-medium text-center mb-2">
                E-posta almadınız mı?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Spam/Gereksiz klasörünü kontrol edin</li>
                <li>• E-posta adresinizin doğru olduğundan emin olun</li>
                <li>• Birkaç dakika bekleyin ve tekrar deneyin</li>
              </ul>
            </div>
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}
