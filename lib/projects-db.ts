import fs from "node:fs";
import path from "node:path";
import { createServerSupabase } from "./supabase-server";
import type { Project, ProjectMeta, StepEntry } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

interface DbProject {
  id: string;
  sort_index: number;
  title: string;
  hero_image: string;
  description: string;
  meta_title: string | null;
  meta_description: string | null;
  pdf: string | null;
  listed: boolean;
  copyedit: boolean;
  last_tested: string;
  version: number | null;
}

interface DbStep {
  id: number;
  project_id: string;
  step_number: number;
  title: string;
  content: string;
  completion: string[];
  knowledge_quiz: Record<string, unknown> | null;
  challenge: boolean;
}

function stepToMeta(step: DbStep): StepEntry {
  const entry: StepEntry = { title: step.title };
  if (step.completion && step.completion.length > 0) {
    entry.completion = step.completion;
  }
  if (step.knowledge_quiz) {
    entry.knowledge_quiz = step.knowledge_quiz as StepEntry["knowledge_quiz"];
  }
  if (step.challenge) {
    (entry as Record<string, unknown>).challenge = true;
  }
  return entry;
}

function dbProjectToProject(proj: DbProject, steps: StepEntry[]): Project {
  const meta: ProjectMeta = {
    title: proj.title,
    hero_image: proj.hero_image,
    description: proj.description,
    listed: proj.listed,
    copyedit: proj.copyedit,
    last_tested: proj.last_tested,
    steps,
  };
  if (proj.meta_title) meta.meta_title = proj.meta_title;
  if (proj.meta_description) meta.meta_description = proj.meta_description;
  if (proj.pdf) meta.pdf = proj.pdf;
  if (proj.version) meta.version = proj.version;

  return {
    id: proj.id,
    meta,
    stepCount: steps.length,
    directoryName: `${proj.sort_index}.${proj.id}`,
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects, error: projError } = await (supabase as any)
    .from("projects")
    .select("*")
    .order("sort_index", { ascending: true });

  if (projError) throw projError;
  if (!projects) return [];

  const result: Project[] = [];

  for (const proj of projects as DbProject[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: steps, error: stepError } = await (supabase as any)
      .from("steps")
      .select("*")
      .eq("project_id", proj.id)
      .order("step_number", { ascending: true });

    if (stepError) throw stepError;

    const stepEntries = ((steps as DbStep[]) ?? []).map(stepToMeta);
    result.push(dbProjectToProject(proj, stepEntries));
  }

  return result;
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proj, error: projError } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projError || !proj) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: steps, error: stepError } = await (supabase as any)
    .from("steps")
    .select("*")
    .eq("project_id", id)
    .order("step_number", { ascending: true });

  if (stepError) throw stepError;

  const stepEntries = ((steps as DbStep[]) ?? []).map(stepToMeta);
  return dbProjectToProject(proj as DbProject, stepEntries);
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | null> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proj, error: projError } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projError || !proj) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: steps, error: stepError } = await (supabase as any)
    .from("steps")
    .select("*")
    .eq("project_id", id)
    .order("step_number", { ascending: true });

  if (stepError) throw stepError;

  const stepEntries = ((steps as DbStep[]) ?? []).map(stepToMeta);
  const p = proj as DbProject;

  const meta: ProjectMeta = {
    title: p.title,
    hero_image: p.hero_image,
    description: p.description,
    listed: p.listed,
    copyedit: p.copyedit,
    last_tested: p.last_tested,
    steps: stepEntries,
  };
  if (p.meta_title) meta.meta_title = p.meta_title;
  if (p.meta_description) meta.meta_description = p.meta_description;
  if (p.pdf) meta.pdf = p.pdf;
  if (p.version) meta.version = p.version;

  return meta;
}

export async function getStepContent(
  projectId: string,
  stepIndex: number
): Promise<string | null> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("steps")
    .select("content")
    .eq("project_id", projectId)
    .eq("step_number", stepIndex)
    .single();

  if (error || !data) return null;
  return (data as { content: string }).content;
}

export function getProjectDir(projectId: string): string {
  return projectId;
}

export function resolveProjectAsset(
  projectId: string,
  relativePath: string
): string {
  const dirMapping: Record<string, string> = {};
  try {
    const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const parsed = parseProjectDir(entry.name);
      if (parsed) {
        dirMapping[parsed.name] = entry.name;
      } else {
        dirMapping[entry.name] = entry.name;
      }
    }
    const actualDir = dirMapping[projectId] ?? projectId;
    const fullPath = path.join(PROJECTS_DIR, actualDir, "en", relativePath);

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  } catch {
    // fall through to Supabase Storage
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/project-assets/${projectId}/${relativePath}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getStepPath(_projectId: string, _stepIndex: number): string {
  throw new Error("getStepPath is deprecated with DB backend");
}

function parseProjectDir(dirName: string): { index: number; name: string } | null {
  const match = dirName.match(/^(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: Number.parseInt(match[1], 10), name: match[2] };
}
