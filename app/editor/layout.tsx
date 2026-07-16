import Link from "next/link";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200/80 bg-zinc-50/50 lg:block dark:border-zinc-800/80 dark:bg-zinc-950/50">
        <nav className="sticky top-14 p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Editor
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/editor"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-scratch-blue"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/editor/new"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-scratch-blue"
              >
                + New Project
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
