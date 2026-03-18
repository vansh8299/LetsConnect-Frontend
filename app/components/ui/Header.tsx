// app/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, MessageSquare, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { checkAuthStatus } from "@/app/lib/utils/auth.utils";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Replace the useEffect in Header.tsx with this:
  useEffect(() => {
    checkAuthStatus().then((auth) => {
      setIsAuthenticated(auth);
    });
  }, [pathname]);

  const handleLogout = () => {
    // Clear both cookies by setting expiry in the past
    document.cookie = "accessToken=; Max-Age=0; Path=/;";
    document.cookie = "refreshToken=; Max-Age=0; Path=/;";
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const isOnLogin = pathname === "/login";
  const isOnSignup = pathname === "/signup";

  // What to show in the nav when not authenticated
  const authLinks = () => {
    if (isOnSignup) {
      // On signup page → only show Sign In
      return (
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-3 py-2 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Sign In
        </Link>
      );
    }
    if (isOnLogin) {
      // On login page → only show Get Started
      return (
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-3 py-2 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Get Started
        </Link>
      );
    }
    // All other pages → show both
    return (
      <>
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 sm:px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-3 py-2 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Get Started
        </Link>
      </>
    );
  };

  // Same logic for mobile menu links
  const mobileAuthLinks = () => {
    if (isOnSignup) {
      return (
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign In
        </Link>
      );
    }
    if (isOnLogin) {
      return (
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Get Started
        </Link>
      );
    }
    return (
      <>
        <Link
          href="/login"
          className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Get Started
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              LetsConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-3 md:flex">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 sm:px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              authLinks()
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              ) : (
                <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800 md:hidden">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                mobileAuthLinks()
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
