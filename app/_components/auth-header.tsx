"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function AuthHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/"
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Home
      </Link>
      {status === "authenticated" && session?.user ? (
        <>
          <Link
            href="/editor"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Editor
          </Link>
          <span className="text-xs text-zinc-400">{session.user.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          href="/editor/login"
          className="rounded-lg bg-scratch-blue px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-scratch-purple"
        >
          Login
        </Link>
      )}
    </>
  );
}
