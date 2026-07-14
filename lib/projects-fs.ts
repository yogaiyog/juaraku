import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import type { Project, ProjectMeta } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

function parseProjectDir(dirName: string): { index: number; name: string } | null {
  const match = dirName.match(/^(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: Number.parseInt(match[1], 10), name: match[2] };
}

function getDirectoryMapping(): Map<string, string> {
  const mapping = new Map<string, string>();
  if (!fs.existsSync(PROJECTS_DIR)) return mapping;
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parsed = parseProjectDir(entry.name);
    if (parsed) {
      mapping.set(parsed.name, entry.name);
    } else {
      mapping.set(entry.name, entry.name);
    }
  }
  return mapping;
}

export function getProjectDirFS(projectId: string): string {
  return getDirectoryMapping().get(projectId) ?? projectId;
}

export async function getAllProjectsFS(): Promise<Project[]> {
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const raw: { project: Project; index: number }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parsed = parseProjectDir(entry.name);
    const id = parsed ? parsed.name : entry.name;
    const dirName = entry.name;

    const meta = await getProjectMetaFS(dirName);
    if (!meta) continue;

    const stepCount = (meta.steps ?? []).length;

    raw.push({
      index: parsed?.index ?? 0,
      project: { id, meta, stepCount, directoryName: dirName },
    });
  }

  raw.sort((a, b) => a.index - b.index);
  return raw.map((r) => r.project);
}

export async function getProjectFS(id: string): Promise<Project | null> {
  const dirName = getProjectDirFS(id);
  const meta = await getProjectMetaFS(dirName);
  if (!meta) return null;
  const stepCount = (meta.steps ?? []).length;
  return { id, meta, stepCount, directoryName: dirName };
}

export async function getProjectMetaFS(
  dirNameOrId: string
): Promise<ProjectMeta | null> {
  const dirName = getDirectoryMapping().get(dirNameOrId) ?? dirNameOrId;
  const metaPath = path.join(PROJECTS_DIR, dirName, "en", "meta.yml");
  if (!fs.existsSync(metaPath)) return null;
  const raw = fs.readFileSync(metaPath, "utf-8");
  return load(raw) as ProjectMeta;
}

export function resolveProjectAssetFS(
  projectId: string,
  relativePath: string
): string {
  const dirName = getProjectDirFS(projectId);
  return path.join(PROJECTS_DIR, dirName, "en", relativePath);
}

export function getStepPathFS(projectId: string, stepIndex: number): string {
  const dirName = getProjectDirFS(projectId);
  return path.join(PROJECTS_DIR, dirName, "en", `step_${stepIndex}.md`);
}

export async function getStepContentFS(
  projectId: string,
  stepIndex: number
): Promise<string | null> {
  const filePath = getStepPathFS(projectId, stepIndex);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}
