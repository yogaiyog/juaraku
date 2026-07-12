import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  className?: string;
  onClick?: () => void;
};

const variants = {
  primary:
    "bg-scratch-blue text-white hover:bg-scratch-blue/90 shadow-md shadow-scratch-blue/20",
  secondary:
    "bg-white border-2 border-scratch-blue text-scratch-blue hover:bg-scratch-blue/5 dark:bg-transparent dark:border-scratch-blue/60 dark:text-scratch-blue/90",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
};

const base =
  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200";

export default function Button({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
