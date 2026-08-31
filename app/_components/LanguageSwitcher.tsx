"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<string>("id");

  useEffect(() => {
    const current = getCookie("locale") || "id";
    setLocale(current);
  }, []);

  const changeLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold shadow-xs transition-opacity dark:border-zinc-800 dark:bg-zinc-900 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
      role="group"
      aria-label="Pilih Bahasa / Choose Language"
    >
      <button
        type="button"
        onClick={() => changeLocale("id")}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
          locale === "id"
            ? "bg-white text-scratch-blue shadow-xs font-bold dark:bg-zinc-800 dark:text-blue-400"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="Bahasa Indonesia"
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => changeLocale("en")}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
          locale === "en"
            ? "bg-white text-scratch-blue shadow-xs font-bold dark:bg-zinc-800 dark:text-blue-400"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
