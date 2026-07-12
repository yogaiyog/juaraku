import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import Container from "./_components/Container";
import ProjectCard from "./_components/ProjectCard";

export const metadata: Metadata = {
  title: "Scratch Projects",
  description: "Interactive Scratch coding projects for learning",
};

export default async function HomePage() {
  const projects = await getAllProjects();

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          Scratch{" "}
          <span className="text-scratch-blue">
            Projects
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-zinc-500">
          Learn coding the fun way — interactive Scratch projects step by step
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i + 1} />
          ))}
        </div>
      )}
    </Container>
  );
}
