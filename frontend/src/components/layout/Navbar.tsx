"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-white"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
            TextilePro
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-slate-300 hover:text-white transition"
            >
              Özellikler
            </Link>
            <Link
              href="/#use-cases"
              className="text-slate-300 hover:text-white transition"
            >
              Kim İçin?
            </Link>
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white"
                    onClick={() => signOut()}
                  >
                    Çıkış
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      className="text-slate-300 hover:text-white"
                    >
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Başla
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-700 pt-4">
            <Link
              href="/#features"
              className="block text-slate-300 hover:text-white transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Özellikler
            </Link>
            <Link
              href="/#use-cases"
              className="block text-slate-300 hover:text-white transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Kim İçin?
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-slate-600"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    Çıkış
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-slate-600"
                    >
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Başla
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
