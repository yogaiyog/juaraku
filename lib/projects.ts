import { prisma } from "./prisma";
import type { Category, Path, Project, ProjectMeta, StepEntry } from "./types";

const cache = new Map<string, { data: Promise<unknown>; expiry: number }>();
const CACHE_TTL = 60_000;

function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data as Promise<T>;
  const promise = fetcher();
  cache.set(key, { data: promise, expiry: Date.now() + CACHE_TTL });
  return promise;
}

export function invalidateProjectCache() {
  cache.delete("all-projects");
}

export function invalidatePathCache() {
  cache.delete("paths");
}

function parseSteps(steps: {
  stepNumber: number;
  title: string;
  completion: unknown;
  hasQuiz: boolean;
  quizPath: string | null;
  quizVersion: number | null;
  quizQuestions: number | null;
  quizPassingScore: number | null;
  isChallenge: boolean;
}[]): StepEntry[] {
  steps.sort((a, b) => a.stepNumber - b.stepNumber);
  return steps.map((s) => {
    const entry: StepEntry = { title: s.title };
    if (s.completion) entry.completion = s.completion as string[];
    if (s.hasQuiz && s.quizPath) {
      entry.knowledge_quiz = {
        path: s.quizPath,
        version: s.quizVersion ?? 1,
        questions: s.quizQuestions ?? 0,
        passing_score: s.quizPassingScore ?? 0,
      };
    }
    return entry;
  });
}

function buildMeta(
  steps: {
    stepNumber: number;
    title: string;
    completion: unknown;
    hasQuiz: boolean;
    quizPath: string | null;
    quizVersion: number | null;
    quizQuestions: number | null;
    quizPassingScore: number | null;
    isChallenge: boolean;
  }[] | null,
  data: {
    title: string;
    heroImage: string | null;
    description: string | null;
    listed: boolean | null;
    copyedit: boolean | null;
    lastTested: Date | null;
    version: number | null;
    metaTitle: string | null;
    metaDescription: string | null;
    pdf: string | null;
  }
): ProjectMeta {
  const metaSteps = parseSteps(steps ?? []);
  return {
    title: data.title,
    hero_image: data.heroImage ?? "",
    description: data.description ?? "",
    listed: data.listed ?? true,
    copyedit: data.copyedit ?? false,
    last_tested: data.lastTested
      ? new Date(data.lastTested).toISOString().slice(0, 10)
      : "",
    version: data.version ?? undefined,
    meta_title: data.metaTitle ?? undefined,
    meta_description: data.metaDescription ?? undefined,
    pdf: data.pdf ?? undefined,
    steps: metaSteps,
  };
}

export async function getProjectDir(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { slug: projectId },
    select: { dirName: true },
  });
  return project?.dirName ?? projectId;
}

export async function getAllProjects(): Promise<Project[]> {
  return withCache("all-projects", async () => {
    const projects = await prisma.project.findMany({
      include: {
        steps: true,
        categories: { include: { category: true } },
        paths: { include: { path: true }, orderBy: { pathIndex: "asc" } },
      },
      orderBy: { dirIndex: "asc" },
    });

    return projects.map((row) => {
      const categories: Category[] = row.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      }));
      const paths: Path[] = row.paths.map((pp) => ({
        id: pp.path.id,
        name: pp.path.name,
        slug: pp.path.slug,
        description: pp.path.description,
      }));
      const meta = buildMeta(row.steps, row);
      return {
        id: row.slug,
        meta,
        stepCount: meta.steps.length,
        directoryName: row.dirName,
        categories,
        paths,
      };
    });
  });
}

export async function getProject(id: string): Promise<Project | null> {
  return withCache(`project-${id}`, async () => {
    const row = await prisma.project.findUnique({
      where: { slug: id },
      include: {
        steps: true,
        categories: { include: { category: true } },
        paths: { include: { path: true }, orderBy: { pathIndex: "asc" } },
      },
    });

    if (!row) return null;

    const categories: Category[] = row.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
      slug: pc.category.slug,
    }));
    const paths: Path[] = row.paths.map((pp) => ({
      id: pp.path.id,
      name: pp.path.name,
      slug: pp.path.slug,
      description: pp.path.description,
    }));
    const meta = buildMeta(row.steps, row);
    return {
      id: row.slug,
      meta,
      stepCount: meta.steps.length,
      directoryName: row.dirName,
      categories,
      paths,
      certificate: row.certificate,
    };
  });
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | null> {
  const project = await getProject(id);
  return project?.meta ?? null;
}

export function getMinioKey(projectId: string, relativePath: string): string {
  return `projects/${projectId}/en/${relativePath}`;
}

export async function resolveProjectAsset(
  projectId: string,
  relativePath: string
): Promise<string> {
  const dirName = await getProjectDir(projectId);
  return `projects/${dirName}/en/${relativePath}`;
}

export async function getStepPath(
  projectId: string,
  stepIndex: number
): Promise<string> {
  const dirName = await getProjectDir(projectId);
  return `projects/${dirName}/en/step_${stepIndex}.md`;
}

export async function getCategories(): Promise<Category[]> {
  return withCache("categories", async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  });
}

export async function getProjectsByCategory(
  categorySlug: string
): Promise<Project[]> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return [];

  const projectCategories = await prisma.projectCategory.findMany({
    where: { categoryId: category.id },
    select: { projectId: true },
  });

  if (projectCategories.length === 0) return [];

  const ids = projectCategories.map((pc) => pc.projectId);

  const projects = await prisma.project.findMany({
    where: { id: { in: ids } },
    include: {
      steps: true,
      categories: { include: { category: true } },
    },
    orderBy: { dirIndex: "asc" },
  });

  return projects.map((row) => {
    const cats: Category[] = row.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
      slug: pc.category.slug,
    }));
    const meta = buildMeta(row.steps, row);
    return {
      id: row.slug,
      meta,
      stepCount: meta.steps.length,
      directoryName: row.dirName,
      categories: cats,
    };
  });
}

export async function getPaths(): Promise<Path[]> {
  return withCache("paths", async () => {
    const paths = await prisma.path.findMany({
      orderBy: { name: "asc" },
    });
    return paths;
  });
}

export async function getProjectsByPath(pathSlug: string): Promise<Project[]> {
  const path = await prisma.path.findUnique({
    where: { slug: pathSlug },
  });

  if (!path) return [];

  const projectPaths = await prisma.projectPath.findMany({
    where: { pathId: path.id },
    select: { projectId: true, pathIndex: true },
    orderBy: { pathIndex: "asc" },
  });

  if (projectPaths.length === 0) return [];

  const ids = projectPaths.map((pp) => pp.projectId);
  const indexMap = new Map(projectPaths.map((pp) => [pp.projectId, pp.pathIndex]));

  const projects = await prisma.project.findMany({
    where: { id: { in: ids } },
    include: {
      steps: true,
      categories: { include: { category: true } },
    },
    orderBy: { dirIndex: "asc" },
  });

  return projects
    .map((row) => {
      const cats: Category[] = row.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      }));
      const meta = buildMeta(row.steps, row);
      return {
        id: row.slug,
        meta,
        stepCount: meta.steps.length,
        directoryName: row.dirName,
        categories: cats,
        pathIndex: indexMap.get(row.id) ?? 0,
      };
    })
    .sort((a, b) => (a.pathIndex ?? 0) - (b.pathIndex ?? 0));
}

export async function getStepRawContent(
  projectId: string,
  stepIndex: number
): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { slug: projectId },
    select: { id: true },
  });

  if (!project) return null;

  const step = await prisma.step.findUnique({
    where: {
      projectId_stepNumber: {
        projectId: project.id,
        stepNumber: stepIndex,
      },
    },
    select: { content: true },
  });

  if (!step) return null;
  return step.content ?? "";
}

export function invalidateCache(projectId?: string) {
  if (projectId) {
    cache.delete(`project-${projectId}`);
  }
  cache.delete("all-projects");
  cache.delete("categories");
  cache.delete("paths");
}
