"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { RegisterSchema } from "../../lib/schema";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { CardWrapper } from "./card-wrapper";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

// GraphQL Mutation query string
const SIGNUP_MUTATION = `
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name)
  }
`;

export const SignupForm = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setFormError("");
    setFormSuccess("");
    setIsLoading(true);

    try {
      // Backend'e GraphQL signup mutation gönder
      const response = await fetch("http://localhost:4001/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: SIGNUP_MUTATION,
          variables: {
            email: values.email,
            password: values.password,
            name: values.name,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        const errorMessage = data.errors[0].message || "Kayıt başarısız oldu";
        setFormError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.data?.signup) {
        setFormSuccess(
          "Hesap başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz..."
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu";
      setFormError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGithubLoading(true);
    try {
      await signIn("github", {
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch {
      setFormError("GitHub giriş başarısız oldu");
      setIsGithubLoading(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Yeni hesap oluşturun"
      backButtonLabel="Zaten hesabınız var mı?"
      backButtonHref="/auth/login"
      showSocial
      descLabel="Hesapınız var mı?"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="Adınız Soyadınız"
                          type="text"
                          className="pl-10"
                          autoComplete="name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
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
            </div>

            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <p>Şifre şu özellikleri içermelidir:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>En az 8 karakter</li>
                        <li>En az bir büyük harf</li>
                        <li>En az bir küçük harf</li>
                        <li>En az bir sayı</li>
                        <li>En az bir özel karakter (!@#$%^&*)</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />
            </div>

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
                  Hesap oluşturuluyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Veya
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isGithubLoading}
            >
              {isGithubLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  GitHub ile bağlanıyor...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub ile Kayıt Ol
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Kayıt yaparak{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Hizmet Şartlarını
              </Link>{" "}
              kabul ediyorsunuz.
            </p>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
