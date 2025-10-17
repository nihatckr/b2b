"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";

import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLoginMutation } from "../../../__generated__/graphql";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
interface LoginFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [, loginMutation] = useLoginMutation();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await loginMutation({
        input: {
          email: data.email,
          password: data.password,
        },
      });

      // Check for URQL errors first
      if (result.error) {
        // Handle GraphQL errors from URQL
        const errorMessage =
          result.error.graphQLErrors?.[0]?.message ||
          result.error.networkError?.message ||
          result.error.message ||
          "Login failed";

        // Show error toast
        showToast(errorMessage, "error");

        // Display error message from server
        form.setError("root", {
          message: errorMessage,
        });
        return;
      }

      if (result.data?.login?.token) {
        // Use auth context to handle login
        login(result.data.login.token, result.data.login.user as any);

        // Show success toast
        showToast(
          `Welcome back, ${
            result.data.login.user?.name || result.data.login.user?.email
          }!`,
          "success"
        );

        // Call onSuccess if provided (for modal usage)
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect after toast (for standalone form usage)
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }

      // Show server error message directly
      const serverMessage =
        error instanceof Error ? error.message : "Login failed";

      // Show error toast
      showToast(serverMessage, "error");

      // Display error message from server
      form.setError("root", {
        message: serverMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
          <CardDescription>
            Hesabınıza giriş yaparak devam edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="ornek@email.com"
                        disabled={isLoading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Şifre</FormLabel>
                      <a
                        href="#"
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Şifremi Unuttum?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    veya
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                Hesabınız yok mu?{" "}
                <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Hemen Kaydolun
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Demo Accounts Info */}
      <Card className="border-0 bg-blue-50/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-semibold text-gray-700">🧪 Demo Hesaplar:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white rounded p-2">
                <p className="font-medium">Admin</p>
                <p className="text-gray-500">admin@platform.com</p>
              </div>
              <div className="bg-white rounded p-2">
                <p className="font-medium">Üretici</p>
                <p className="text-gray-500">ahmet@defacto.com</p>
              </div>
            </div>
            <p className="text-gray-500 italic">Şifre: myPassword42 / random42</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
