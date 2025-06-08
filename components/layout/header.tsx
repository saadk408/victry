// File: /app/_components/layout/header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Session } from "@supabase/supabase-js";

interface HeaderProps {
  session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
  const isLoggedIn = !!session;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center text-xl font-bold text-foreground">
          Victry
        </Link>

        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
                Dashboard
              </Link>
              <Link href="/account" className="text-sm font-medium text-foreground hover:text-primary">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
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
