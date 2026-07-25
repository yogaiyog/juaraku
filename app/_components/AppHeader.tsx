"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AuthHeader from "./auth-header";

export default function AppHeader() {
  const pathname = usePathname();
  const isProjectEditor = pathname.startsWith("/project-editor");

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {isProjectEditor ? (
          <div className="flex items-center gap-2 font-bold text-scratch-blue">
            <img src="/logo.png" alt="Scratch Projects" className="h-6 w-6" />
            JuaraKu
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-scratch-blue transition-colors hover:text-scratch-purple"
          >
            <img src="/logo.png" alt="Scratch Projects" className="h-6 w-6" />
            JuaraKu
          </Link>
        )}
        {!isProjectEditor && (
          <>
            <div className="flex-1" />
            <AuthHeader />
          </>
        )}
      </div>
    </header>
  );
}
