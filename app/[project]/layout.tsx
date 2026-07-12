import Link from "next/link";
import { getProject, getAllProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import StepNavClient from "../_components/StepNavClient";
import BackLink from "../_components/BackLink";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ project: string }>;
};

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ project: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await params;
  const proj = await getProject(project);
  if (!proj) return { title: "Not Found" };
  return {
    title: proj.meta.title,
    description: proj.meta.description,
  };
}

export default async function ProjectLayout({ children, params }: Props) {
  const { project } = await params;
  const proj = await getProject(project);

  if (!proj) notFound();

  return (
    <div className="mx-auto flex max-w-[90rem] gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <BackLink className="mb-4" />
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Link
              href={`/${project}`}
              className="mb-1 block text-base font-bold text-zinc-900 transition-colors hover:text-scratch-blue dark:text-zinc-100"
            >
              {proj.meta.title}
            </Link>
            <p className="text-xs text-zinc-400">{proj.stepCount} steps</p>
          </div>
          <StepNavClient projectId={project} steps={proj.meta.steps} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <BackLink />
        </div>
        {children}
      </main>
    </div>
  );
}
