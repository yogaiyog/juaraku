import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
  className?: string;
};

export default function BackLink({
  href = "/",
  label = "",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm font-bold text-scratch-blue transition-colors hover:text-scratch-purple ${className}`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
