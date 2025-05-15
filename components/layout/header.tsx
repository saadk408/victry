// File: /app/_components/layout/header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Session } from "@supabase/auth-helpers-nextjs";

interface HeaderProps {
  session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
  const isLoggedIn = !!session;

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm dark:bg-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center text-xl font-bold">
          Victry
        </Link>

        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/account" className="text-sm font-medium">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
