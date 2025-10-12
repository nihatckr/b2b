"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Login, signup ve dashboard sayfalarında navbar gösterme
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  // Anasayfada normal navbar göster
  return <Navbar loginText="Login" signupText="Sign Up" />;
}
