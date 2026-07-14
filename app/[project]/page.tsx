import { getProject, getAllProjects } from "@/lib/projects";
import { getStepContent } from "@/lib/markdown";
import { notFound } from "next/navigation";
import Image from "next/image";
import { renderMarkdown } from "@/lib/render-markdown";
import { applyTransforms } from "@/lib/transform-images";
import Button from "@/app/_components/Button";
import ScratchContent from "@/app/_components/ScratchContent";
import type { Metadata } from "next";

type Props = {
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
  return { title: proj.meta.title };
}

export default async function ProjectPage({ params }: Props) {
  const { project } = await params;
  const proj = await getProject(project);
  if (!proj) notFound();

  const firstStepContent = await getStepContent(project, 1);

  const introHtml = firstStepContent
    .filter((seg) => seg.type === "markdown")
    .map((seg) => applyTransforms(renderMarkdown(seg.content), project))
    .join("");

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-scratch-blue/5 shadow-lg">
        <div className="relative aspect-[2/1] max-h-[400px] overflow-hidden">
          <Image
            src={`/api/assets/${project}/${proj.meta.hero_image}`}
            alt={proj.meta.title}
            fill
            sizes="(max-width: 1023px) 100vw, 1088px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl">
              {proj.meta.title}
            </h1>
          </div>
        </div>
      </div>

      <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400 italic">
        {proj.meta.description}
      </p>

      {introHtml && (
        <ScratchContent
          className="prose prose-zinc mb-8 max-w-none rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:prose-invert prose-a:text-scratch-blue"
          html={introHtml}
        />
      )}

      <Button href={`/${project}/1`} variant="primary">
        Start Project
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Button>
    </div>
  );
}
