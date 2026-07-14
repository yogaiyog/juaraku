import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaths, getProjectsByPath } from "@/lib/projects";
import Container from "@/app/_components/Container";
import Image from "next/image";
import Badge from "@/app/_components/Badge";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const paths = await getPaths();
  return paths.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const paths = await getPaths();
  const found = paths.find((p) => p.slug === slug);
  return { title: found ? `${found.name} - JuaraKu` : "Not Found" };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const paths = await getPaths();
  const pathData = paths.find((p) => p.slug === slug);
  if (!pathData) notFound();

  const projects = await getProjectsByPath(slug);

  return (
    <Container className="py-6 sm:py-10">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-sm text-zinc-500 hover:text-scratch-blue"
        >
          &larr; All Projects
        </Link>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-scratch-blue sm:text-4xl dark:text-zinc-100">
          {pathData.name}
        </h1>
        {pathData.description && (
          <p className="max-w-2xl text-lg text-zinc-500 italic">
            {pathData.description}
          </p>
        )}
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">No projects in this path yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, i) => (
            <Link
              key={project.id}
              href={`/${project.id}`}
              className="group flex items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Number */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-scratch-blue/10 text-lg font-bold text-scratch-blue">
                {(project.pathIndex ?? i) + 1}
              </div>

              {/* Image */}
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={`/api/assets/${project.id}/${project.meta.hero_image}`}
                  alt={project.meta.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {project.meta.title}
                </h2>
                <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">
                  {project.meta.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="default">{project.stepCount} steps</Badge>
                  {project.categories.map((cat) => (
                    <Badge key={cat.id} variant="category">{cat.name}</Badge>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-zinc-300 transition-colors group-hover:text-scratch-blue dark:text-zinc-600">
                &rarr;
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
