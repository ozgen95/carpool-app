import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carpool",
  description: "Find rides, save money, share the road.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex h-16 items-center justify-between gap-4 px-6 border-b">
            <Link href="/" className="font-semibold text-lg">
              Carpool
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/rides/search"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Find a ride
              </Link>
              <AuthButtons />
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
