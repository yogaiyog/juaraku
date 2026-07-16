import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import Providers from "./_components/providers";
import AuthHeader from "./_components/auth-header";
import FooterCertificate from "./_components/FooterCertificate";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JuaraKu",
  description: "Interactive Scratch coding projects for learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased bg-white dark:bg-zinc-950`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-scratch-blue transition-colors hover:text-scratch-purple"
              >
                <img src="/logo.png" alt="Scratch Projects" className="h-6 w-6" />
                JuaraKu
              </Link>
              <div className="flex-1" />
              <AuthHeader />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200/80 bg-zinc-50/50 py-6 dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <div className="mx-auto flex max-w-[90rem] items-center justify-center gap-4 px-4 sm:px-6 lg:px-8">
              <p className="text-sm text-zinc-500">Juaraku &copy; 2026</p>
              <FooterCertificate />
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
