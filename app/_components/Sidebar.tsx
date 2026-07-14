import Link from "next/link";
import type { Category, Path } from "@/lib/types";

type Props = {
  categories: Category[];
  paths: Path[];
  activeCategory?: string;
};

export default function Sidebar({ categories, paths, activeCategory }: Props) {
  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-56">

       {/* Paths */}
      {paths.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Learning Path
          </h3>
          <nav className="space-y-1">
            {paths.map((path) => (
              <Link
                key={path.id}
                href={`/path/${path.slug}`}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-scratch-blue/5 hover:text-scratch-blue dark:text-zinc-400 dark:hover:bg-scratch-blue/10"
              >
                <span className="text-base">&#128218;</span>
                <span className="flex-1">{path.name}</span>
                <span className="text-xs text-zinc-300 transition-colors group-hover:text-scratch-blue dark:text-zinc-600">
                  &rarr;
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}


      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Kategori
          </h3>
          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? "bg-scratch-blue text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Semua Project
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`?category=${cat.slug}`}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-scratch-blue text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

     
    </aside>
  );
}
