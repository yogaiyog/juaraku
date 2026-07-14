import { createServerSupabase } from "./supabase-server";
import {
  getAllProjectsFS,
  getProjectFS,
  getProjectMetaFS,
  getStepContentFS,
  getProjectDirFS,
  resolveProjectAssetFS,
  getStepPathFS,
} from "./projects-fs";
import {
  getAllProjects as getAllProjectsDB,
  getProject as getProjectDB,
  getProjectMeta as getProjectMetaDB,
  getStepContent as getStepContentDB,
} from "./projects-db";
import type { Project, ProjectMeta } from "./types";

function isDbAvailable(): boolean {
  return createServerSupabase() !== null;
}

export function parseProjectDir(dirName: string): { index: number; name: string } | null {
  const match = dirName.match(/^(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: Number.parseInt(match[1], 10), name: match[2] };
}

export async function getAllProjects(): Promise<Project[]> {
  if (isDbAvailable()) {
    try {
      const projects = await getAllProjectsDB();
      if (projects.length > 0) return projects;
    } catch {
      // fall through to filesystem
    }
  }
  return getAllProjectsFS();
}

export async function getProject(id: string): Promise<Project | null> {
  if (isDbAvailable()) {
    try {
      const proj = await getProjectDB(id);
      if (proj) return proj;
    } catch {
      // fall through to filesystem
    }
  }
  return getProjectFS(id);
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | null> {
  if (isDbAvailable()) {
    try {
      const meta = await getProjectMetaDB(id);
      if (meta) return meta;
    } catch {
      // fall through to filesystem
    }
  }
  return getProjectMetaFS(id);
}

export async function getStepContent(
  projectId: string,
  stepIndex: number
): Promise<string | null> {
  if (isDbAvailable()) {
    try {
      const content = await getStepContentDB(projectId, stepIndex);
      if (content) return content;
    } catch {
      // fall through to filesystem
    }
  }
  return getStepContentFS(projectId, stepIndex);
}

export function getProjectDir(projectId: string): string {
  return getProjectDirFS(projectId);
}

export function resolveProjectAsset(
  projectId: string,
  relativePath: string
): string {
  return resolveProjectAssetFS(projectId, relativePath);
}

export { getStepPathFS as getStepPath };
