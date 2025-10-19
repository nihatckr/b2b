"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { RequestPasswordResetDocument } from "@/__generated__/graphql";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/auth/form-error";
import { FormSuccess } from "@/components/auth/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetSchema, type ResetInput } from "@/lib/zod-schema";
import { useMutation } from "urql";

export default function ResetPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  const [{ fetching: isLoading }, requestResetMutation] = useMutation(
    RequestPasswordResetDocument
  );

  // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const form = useForm<ResetInput>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ResetInput) => {
    setFormError("");
    setFormSuccess("");

    const result = await requestResetMutation({ email: values.email });

    if (result.error) {
      setFormError(result.error.message);
    } else if (result.data) {
      setFormSuccess(
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi"
      );

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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

  // Don't render if authenticated (will redirect)
  if (status === "authenticated") {
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
          headerLabel="Şifrenizi sıfırlayın"
          backButtonLabel="Giriş sayfasına dön"
          backButtonHref="/auth/login"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta Adresi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="ornek@email.com"
                          type="email"
                          className="pl-10"
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={formError} />
              <FormSuccess message={formSuccess} />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sıfırlama Bağlantısı Gönder
                  </>
                )}
              </Button>

              <Link href="/auth/login">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri Dön
                </Button>
              </Link>
            </form>
          </Form>
        </CardWrapper>
      </div>
    </div>
  );
}
