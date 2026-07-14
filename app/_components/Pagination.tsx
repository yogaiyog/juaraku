import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i <= 2 || i > totalPages - 2 || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  const base = "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200";
  const active = `${base} bg-scratch-blue text-white shadow-sm`;
  const inactive = `${base} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800`;
  const disabled = `${base} cursor-not-allowed text-zinc-300 dark:text-zinc-600`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link
          href={`?page=${currentPage - 1}`}
          className={inactive}
          aria-label="Previous page"
        >
          &larr;
        </Link>
      ) : (
        <span className={disabled}>&larr;</span>
      )}

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className={`${base} text-zinc-400`}>
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={page === 1 ? "/" : `?page=${page}`}
            className={page === currentPage ? active : inactive}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={`?page=${currentPage + 1}`}
          className={inactive}
          aria-label="Next page"
        >
          &rarr;
        </Link>
      ) : (
        <span className={disabled}>&rarr;</span>
      )}
    </nav>
  );
}
