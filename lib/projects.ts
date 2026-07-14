import { supabase } from "./supabase";
import type { Project, ProjectMeta, StepEntry } from "./types";

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
      .select("*, steps(*)")
      .order("dir_index");

    if (!projects) return [];

    return projects.map((row) => {
      const steps = (row.steps ?? []) as {
        step_number: number;
        title: string;
        completion: string[] | null;
        has_quiz: boolean;
        quiz_path: string | null;
        quiz_version: number | null;
        quiz_questions: number | null;
        quiz_passing_score: number | null;
        is_challenge: boolean;
      }[];

      steps.sort((a, b) => a.step_number - b.step_number);

      const metaSteps: StepEntry[] = steps.map((s) => {
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

      const meta: ProjectMeta = {
        title: row.title,
        hero_image: row.hero_image ?? "",
        description: row.description ?? "",
        listed: row.listed ?? true,
        copyedit: row.copyedit ?? false,
        last_tested: row.last_tested ?? "",
        version: row.version ?? undefined,
        meta_title: row.meta_title ?? undefined,
        meta_description: row.meta_description ?? undefined,
        pdf: row.pdf ?? undefined,
        steps: metaSteps,
      };

      return {
        id: row.slug,
        meta,
        stepCount: metaSteps.length,
        directoryName: row.dir_name,
      };
    });
  });
}

export async function getProject(id: string): Promise<Project | null> {
  return withCache(`project-${id}`, async () => {
    const { data: row } = await supabase
      .from("projects")
      .select("*, steps(*)")
      .eq("slug", id)
      .single();

    if (!row) return null;

    const steps = (row.steps ?? []) as {
      step_number: number;
      title: string;
      completion: string[] | null;
      has_quiz: boolean;
      quiz_path: string | null;
      quiz_version: number | null;
      quiz_questions: number | null;
      quiz_passing_score: number | null;
      is_challenge: boolean;
    }[];

    steps.sort((a, b) => a.step_number - b.step_number);

    const metaSteps: StepEntry[] = steps.map((s) => {
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

    const meta: ProjectMeta = {
      title: row.title,
      hero_image: row.hero_image ?? "",
      description: row.description ?? "",
      listed: row.listed ?? true,
      copyedit: row.copyedit ?? false,
      last_tested: row.last_tested ?? "",
      version: row.version ?? undefined,
      meta_title: row.meta_title ?? undefined,
      meta_description: row.meta_description ?? undefined,
      pdf: row.pdf ?? undefined,
      steps: metaSteps,
    };

    return {
      id: row.slug,
      meta,
      stepCount: metaSteps.length,
      directoryName: row.dir_name,
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

export function invalidateCache(projectId?: string) {
  if (projectId) {
    cache.delete(`project-${projectId}`);
  }
  cache.delete("all-projects");
}

