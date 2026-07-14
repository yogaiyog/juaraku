import type { Project } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import Badge from "./Badge";

type Props = {
  project: Project;
  index: number;
  priority?: boolean;
};

const colors = [
  "bg-scratch-blue/5 border-scratch-blue/15",
  "bg-scratch-purple/5 border-scratch-purple/15",
  "bg-scratch-orange/5 border-scratch-orange/15",
  "bg-scratch-green/5 border-scratch-green/15",
];

export default function ProjectCard({ project, index, priority }: Props) {
  const colorClass = colors[project.id.length % colors.length];

  return (
    <Link
      href={`/${project.id}`}
      className={`group block overflow-hidden rounded-2xl border bg-white ${colorClass} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900`}
    >
      <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <div className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-zinc-600 shadow-sm dark:bg-zinc-900/90 dark:text-zinc-400">
          {index}
        </div>
        <Image
          src={`/api/assets/${project.id}/${project.meta.hero_image}`}
          alt={project.meta.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {project.meta.title}
      </h2>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
        {project.meta.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="default">{project.stepCount} steps</Badge>
        {project.categories.map((cat) => (
          <Badge key={cat.id} variant="category">{cat.name}</Badge>
        ))}
      </div>
    </Link>
  );
}
