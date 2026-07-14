import { supabase } from "./supabase";
import type { Category, Path, Project, ProjectMeta, StepEntry } from "./types";

// In-memory cache for metadata (TTL 60s)
const cache = new Map<string, { data: Promise<unknown>; expiry: number }>();
const CACHE_TTL = 60_000;

function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data as Promise<T>;
  const promise = fetcher();
  cache.set(key, { data: promise, expiry: Date.now() + CACHE_TTL });
  return promise;
}

type StepRow = {
  step_number: number;
  title: string;
  completion: string[] | null;
  has_quiz: boolean;
  quiz_path: string | null;
  quiz_version: number | null;
  quiz_questions: number | null;
  quiz_passing_score: number | null;
  is_challenge: boolean;
};

function parseSteps(rows: unknown[]): StepEntry[] {
  const steps = rows as StepRow[];
  steps.sort((a, b) => a.step_number - b.step_number);
  return steps.map((s) => {
    const entry: StepEntry = { title: s.title };
    if (s.completion) entry.completion = s.completion;
    if (s.has_quiz && s.quiz_path) {
      entry.knowledge_quiz = {
        path: s.quiz_path,
        version: s.quiz_version ?? 1,
        questions: s.quiz_questions ?? 0,
        passing_score: s.quiz_passing_score ?? 0,
      };
    }
    return entry;
  });
}

function parseCategories(row: unknown): Category[] {
  const pc = row as { project_categories?: { categories?: { id: string; name: string; slug: string } }[] };
  return (pc.project_categories ?? [])
    .map((pc) => pc.categories)
    .filter(Boolean) as Category[];
}

function buildMeta(row: StepRow[] | null, data: {
  title: string;
  hero_image: string | null;
  description: string | null;
  listed: boolean | null;
  copyedit: boolean | null;
  last_tested: string | null;
  version: number | null;
  meta_title: string | null;
  meta_description: string | null;
  pdf: string | null;
}): ProjectMeta {
  const metaSteps = parseSteps(row ?? []);
  return {
    title: data.title,
    hero_image: data.hero_image ?? "",
    description: data.description ?? "",
    listed: data.listed ?? true,
    copyedit: data.copyedit ?? false,
    last_tested: data.last_tested ?? "",
    version: data.version ?? undefined,
    meta_title: data.meta_title ?? undefined,
    meta_description: data.meta_description ?? undefined,
    pdf: data.pdf ?? undefined,
    steps: metaSteps,
  };
}

export async function getProjectDir(projectId: string): Promise<string> {
  const { data } = await supabase
    .from("projects")
    .select("dir_name")
    .eq("slug", projectId)
    .single();
  return data?.dir_name ?? projectId;
}

export async function getAllProjects(): Promise<Project[]> {
  return withCache("all-projects", async () => {
    const { data: projects } = await supabase
      .from("projects")
      .select("*, steps(*), project_categories(categories(*))")
      .order("dir_index");

    if (!projects) return [];

    return projects.map((row) => {
      const categories = parseCategories(row);
      const meta = buildMeta(row.steps, row);
      return {
        id: row.slug,
        meta,
        stepCount: meta.steps.length,
        directoryName: row.dir_name,
        categories,
      };
    });
  });
}

export async function getProject(id: string): Promise<Project | null> {
  return withCache(`project-${id}`, async () => {
    const { data: row } = await supabase
      .from("projects")
      .select("*, steps(*), project_categories(categories(*))")
      .eq("slug", id)
      .single();

    if (!row) return null;

    const categories = parseCategories(row);
    const meta = buildMeta(row.steps, row);
    return {
      id: row.slug,
      meta,
      stepCount: meta.steps.length,
      directoryName: row.dir_name,
      categories,
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

// --- Category functions ---

export async function getCategories(): Promise<Category[]> {
  return withCache("categories", async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    return (data ?? []) as Category[];
  });
}

export async function getProjectsByCategory(categorySlug: string): Promise<Project[]> {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  const { data: projectIds } = await supabase
    .from("project_categories")
    .select("project_id")
    .eq("category_id", category.id);

  if (!projectIds || projectIds.length === 0) return [];

  const ids = projectIds.map((r) => r.project_id);

  const { data: projects } = await supabase
    .from("projects")
    .select("*, steps(*), project_categories(categories(*))")
    .in("id", ids)
    .order("dir_index");

  if (!projects) return [];

  return projects.map((row) => {
    const categories = parseCategories(row);
    const meta = buildMeta(row.steps, row);
    return {
      id: row.slug,
      meta,
      stepCount: meta.steps.length,
      directoryName: row.dir_name,
      categories,
    };
  });
}

// --- Path functions ---

export async function getPaths(): Promise<Path[]> {
  return withCache("paths", async () => {
    const { data } = await supabase
      .from("paths")
      .select("*")
      .order("name");
    return (data ?? []) as Path[];
  });
}

export async function getProjectsByPath(pathSlug: string): Promise<Project[]> {
  const { data: path } = await supabase
    .from("paths")
    .select("id")
    .eq("slug", pathSlug)
    .single();

  if (!path) return [];

  const { data: projectPaths } = await supabase
    .from("project_paths")
    .select("project_id, path_index")
    .eq("path_id", path.id)
    .order("path_index");

  if (!projectPaths || projectPaths.length === 0) return [];

  const ids = projectPaths.map((r) => r.project_id);
  const indexMap = new Map(projectPaths.map((r) => [r.project_id, r.path_index]));

  const { data: projects } = await supabase
    .from("projects")
    .select("*, steps(*), project_categories(categories(*))")
    .in("id", ids)
    .order("dir_index");

  if (!projects) return [];

  return projects
    .map((row) => {
      const categories = parseCategories(row);
      const meta = buildMeta(row.steps, row);
      return {
        id: row.slug,
        meta,
        stepCount: meta.steps.length,
        directoryName: row.dir_name,
        categories,
        pathIndex: indexMap.get(row.id) ?? 0,
      };
    })
    .sort((a, b) => (a.pathIndex ?? 0) - (b.pathIndex ?? 0));
}

export function invalidateCache(projectId?: string) {
  if (projectId) {
    cache.delete(`project-${projectId}`);
  }
  cache.delete("all-projects");
  cache.delete("categories");
  cache.delete("paths");
}
