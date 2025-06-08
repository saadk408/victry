// File: /app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/client";
import { cookies } from "next/headers";

// Import layout components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Import theme provider for dark/light mode
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Import RBAC provider for role-based access control
import { RbacProvider } from "@/components/auth/role-based-access";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Set metadata for the app
export const metadata: Metadata = {
  title: "Victry | AI-Powered Resume Builder",
  description:
    "Tailor your resume to job descriptions with AI assistance and ensure ATS compatibility",
  keywords:
    "resume builder, AI resume, resume tailoring, ATS optimization, job application",
  authors: [{ name: "Victry" }],
  creator: "Victry",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://victry.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://victry.com",
    title: "Victry | AI-Powered Resume Builder",
    description:
      "Tailor your resume to job descriptions with AI assistance and ensure ATS compatibility",
    siteName: "Victry",
  },
  twitter: {
    card: "summary_large_image",
    title: "Victry | AI-Powered Resume Builder",
    description:
      "Tailor your resume to job descriptions with AI assistance and ensure ATS compatibility",
  },
};

export const viewport = { width: "device-width", initialScale: 1 };
export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#0c4a6e" },
];

// Get user session data for the layout
async function getUserSession() {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user session (for header authentication state)
  const session = await getUserSession();

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-background antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RbacProvider>
          {/* Header with authentication state */}
          <Suspense
            fallback={
              <div className="h-16 animate-pulse border-b bg-white dark:bg-gray-800" />
            }
          >
            <Header session={session} />
          </Suspense>

          {/* Main content */}
          <main className="flex-grow">{children}</main>

          {/* Footer */}
          <Footer />

          {/* Toast notifications */}
          <Toaster />
          </RbacProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
