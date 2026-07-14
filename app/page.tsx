import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import Container from "./_components/Container";
import ProjectCard from "./_components/ProjectCard";
import Pagination from "./_components/Pagination";

export const metadata: Metadata = {
  title: "JuaraKu",
  description: "Interactive Scratch coding projects for learning",
};

const PER_PAGE = 6;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const projects = await getAllProjects();
  const sp = await searchParams;
  const page = Math.max(Number.parseInt(sp.page ?? "1", 10) || 1, 1);
  const totalPages = Math.max(Math.ceil(projects.length / PER_PAGE), 1);

  const clampedPage = Math.min(page, totalPages);
  const offset = (clampedPage - 1) * PER_PAGE;
  const paged = projects.slice(offset, offset + PER_PAGE);

  return (
    <Container className="py-6 sm:py-6">
      <div className="mb-12 text-center">
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

      {projects.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mb-4 text-6xl">🎨</div>
          <p className="text-lg text-zinc-500">No projects found yet.</p>
          <p className="text-sm text-zinc-400">
            Add project folders to <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">/projects</code>
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={offset + i + 1} priority={i < 3} />
            ))}
          </div>
          <Pagination currentPage={clampedPage} totalPages={totalPages} />
        </>
      )}
    </Container>
  );
}
