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
import { useSignupMutation } from "../../../__generated__/graphql";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function SignupForm({
  className,
  onSuccess,
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [, signupMutation] = useSignupMutation();

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const result = await signupMutation({
        input: {
          name: data.name,
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
          "Signup failed";

        // Show error toast
        showToast(errorMessage, "error");

        // Display error message from server
        form.setError("root", {
          message: errorMessage,
        });
        return;
      }

      if (result.data?.signup?.token) {
        // Use auth context to handle login
        login(result.data.signup.token, result.data.signup.user as any);

        // Show success toast with user's name
        showToast(
          `Account created successfully! Welcome ${result.data.signup.user?.name}!`,
          "success"
        );

        // Call onSuccess if provided (for modal usage)
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect after a short delay to show the toast (for standalone form usage)
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Signup error:", error);
      }

      // Show server error message via toast
      const serverMessage =
        error instanceof Error ? error.message : "Signup failed";
      showToast(serverMessage, "error");

      // Also set form error for accessibility
      form.setError("root", {
        message: serverMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                        disabled={isLoading}
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show form-level error if any */}
              {form.formState.errors.root && (
                <div className="text-sm text-red-500">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
