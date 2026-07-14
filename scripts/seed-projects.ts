/**
 * Seed script: Migrate existing filesystem projects to Supabase.
 *
 * Usage:
 *   1. Run the SQL migration at supabase/migrations/001_initial.sql in Supabase SQL Editor
 *   2. Copy .env.example to .env.local and fill in credentials
 *   3. Run: npx tsx scripts/seed-projects.ts
 */

import "dotenv/config";

import { WebSocket } from "ws";

globalThis.WebSocket = WebSocket as typeof globalThis.WebSocket;
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import type { ProjectMeta } from "../lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

interface ProjectDir {
  index: number;
  name: string;
  dirName: string;
}

function parseProjectDir(dirName: string): { index: number; name: string } | null {
  const match = dirName.match(/^(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: Number.parseInt(match[1], 10), name: match[2] };
}

function scanProjects(): ProjectDir[] {
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const projects: ProjectDir[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parsed = parseProjectDir(entry.name);
    if (parsed) {
      projects.push({ index: parsed.index, name: parsed.name, dirName: entry.name });
    }
  }

  projects.sort((a, b) => a.index - b.index);
  return projects;
}

function readMetaYaml(dirName: string): ProjectMeta | null {
  const metaPath = path.join(PROJECTS_DIR, dirName, "en", "meta.yml");
  if (!fs.existsSync(metaPath)) return null;
  const raw = fs.readFileSync(metaPath, "utf-8");
  return load(raw) as ProjectMeta;
}

function readStepContent(dirName: string, stepIndex: number): string {
  const stepPath = path.join(PROJECTS_DIR, dirName, "en", `step_${stepIndex}.md`);
  if (!fs.existsSync(stepPath)) return "";
  return fs.readFileSync(stepPath, "utf-8");
}

async function seed() {
  const { createAdminClient } = await import("@supabase/server/core");
  const supabase = createAdminClient();

  const projects = scanProjects();

  if (projects.length === 0) {
    console.log("No projects found in projects/ directory.");
    return;
  }

  for (const proj of projects) {
    console.log(`\nMigrating: ${proj.name} (${proj.dirName})...`);

    const meta = readMetaYaml(proj.dirName);
    if (!meta) {
      console.log(`  SKIP: meta.yml not found`);
      continue;
    }

    const { error: projError } = await supabase
      .from("projects")
      .upsert({
        id: proj.name,
        sort_index: proj.index,
        title: meta.title,
        hero_image: meta.hero_image ?? "images/banner.png",
        description: meta.description ?? "",
        meta_title: meta.meta_title ?? null,
        meta_description: meta.meta_description ?? null,
        pdf: meta.pdf ?? null,
        listed: meta.listed ?? true,
        copyedit: meta.copyedit ?? false,
        last_tested: meta.last_tested ?? "",
        version: meta.version ?? null,
      }, { onConflict: "id" });

    if (projError) {
      console.log(`  ERROR (project): ${projError.message}`);
      continue;
    }

    console.log(`  Project saved. ${meta.steps.length} steps:`);

    for (let i = 0; i < meta.steps.length; i++) {
      const stepNumber = i + 1;
      const step = meta.steps[i];
      const content = readStepContent(proj.dirName, stepNumber);

      const { error: stepError } = await supabase
        .from("steps")
        .upsert({
          project_id: proj.name,
          step_number: stepNumber,
          title: step.title,
          content: content || `## ${step.title}\n\n`,
          completion: step.completion ?? [],
          knowledge_quiz: step.knowledge_quiz ?? null,
          challenge: Boolean((step as Record<string, unknown>).challenge),
        }, { onConflict: "project_id, step_number" });

      if (stepError) {
        console.log(`    Step ${stepNumber}: ERROR - ${stepError.message}`);
      } else {
        console.log(`    Step ${stepNumber}: "${step.title}" OK`);
      }
    }
  }

  console.log("\nSeed complete!");
}

seed().catch(console.error);
