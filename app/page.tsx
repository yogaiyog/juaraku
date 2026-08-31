import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getAllProjects, getCategories, getProjectsByCategory, getPaths } from "@/lib/projects";
import Container from "./_components/Container";
import ProjectCard from "./_components/ProjectCard";
import Pagination from "./_components/Pagination";
import Sidebar from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "JuaraKu",
  description: "Interactive Scratch coding projects for learning",
};

const PER_PAGE = 6;

type Props = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const categorySlug = sp.category;

  const [allCategories, paths] = await Promise.all([getCategories(), getPaths()]);

  const projects = categorySlug
    ? await getProjectsByCategory(categorySlug)
    : await getAllProjects(locale);

  const page = Math.max(Number.parseInt(sp.page ?? "1", 10) || 1, 1);
  const totalPages = Math.max(Math.ceil(projects.length / PER_PAGE), 1);

  const clampedPage = Math.min(page, totalPages);
  const offset = (clampedPage - 1) * PER_PAGE;
  const paged = projects.slice(offset, offset + PER_PAGE);

  return (
    <Container className="py-6 sm:py-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-scratch-blue sm:text-5xl dark:text-zinc-100">
          Juara
          <span className="text-zinc-900">
            Ku
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-zinc-500 italic">
          Belajar coding dengan cara yang menyenangkan — interaktif step-by-step.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          categories={allCategories}
          paths={paths}
          activeCategory={categorySlug}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {projects.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mb-4 text-6xl">&#127912;</div>
              <p className="text-lg text-zinc-500">No projects found yet.</p>
              <p className="text-sm text-zinc-400">
                Add project folders to <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">/projects</code>
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={offset + i + 1} priority={i < 3} />
                ))}
              </div>
              <Pagination currentPage={clampedPage} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
