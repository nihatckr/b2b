"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { cn } from "../../lib/utils";
import { LoginModal } from "../Auth/LoginModal";
import { SignupModal } from "../Auth/SignupModal";
import { Button } from "../ui/button";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  loginText?: string;
  signupText?: string;
}

export const Navbar = ({
  className,
  loginText = "Giriş",
  signupText = "Kayıt Ol",
  ...props
}: NavbarProps) => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  // Current path'i state olarak yönet
  const getCurrentPath = () => {
    return pathname === "/" ? "home" : pathname?.substring(1);
  };

  const [activeItem, setActiveItem] = useState<string | null>(getCurrentPath());

  // Path değiştiğinde activeItem'ı güncelle
  useEffect(() => {
    const currentPath = pathname === "/" ? "home" : pathname?.substring(1);
    setActiveItem(currentPath);
  }, [pathname]);

  const handleClick = (
    e: React.MouseEvent<HTMLElement>,
    { name }: { name: string }
  ) => {
    setActiveItem(name);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={(e) => handleClick(e, { name: "home" })}
            prefetch={activeItem === "home"}
            className={cn(
              "flex items-center space-x-2 transition-colors",
              activeItem === "home"
                ? "text-blue-600 font-semibold"
                : "text-primary hover:text-primary/90"
            )}
          >
            <span className="font-bold text-xl">ProtexFlow</span>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            // Loading state
            <div className="flex items-center gap-3">
              <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          ) : user ? (
            // Logged in state
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user.name}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="text-sm font-medium transition-colors"
              >
                Logout
              </Button>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="text-sm font-medium px-4 h-9 rounded-md shadow-sm transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            // Not logged in state
            <div className="flex items-center gap-3">
              <LoginModal>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {loginText}
                </Button>
              </LoginModal>

              <SignupModal>
                <Button
                  size="sm"
                  className="text-sm font-medium px-4 h-9 rounded-md shadow-sm transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {signupText}
                </Button>
              </SignupModal>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
Navbar.displayName = "Navbar";
