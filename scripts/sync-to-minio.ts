/**
 * Sync script: Upload local projects/ to MinIO + populate Supabase DB
 *
 * Usage:
 *   npm run sync                    → sync all projects
 *   npm run sync -- music-maker     → sync single project by slug
 *   npm run sync -- 1.space-talk    → sync single project by dir name
 */
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { uploadFile, getMimeType } from "../lib/minio";
import { supabase } from "../lib/supabase";
import type { ProjectMeta, StepEntry } from "../lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

function parseProjectDir(dirName: string): {
  index: number;
  name: string;
} | null {
  const match = dirName.match(/^(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: Number.parseInt(match[1], 10), name: match[2] };
}

function walkDir(dir: string, base: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, base));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

export async function syncProject(dirName: string) {
  const slug = parseProjectDir(dirName)?.name ?? dirName;
  const projectDir = path.join(PROJECTS_DIR, dirName);
  const minioPrefix = `projects/${dirName}`;

  // Determine dir_index from DB (not from folder name)
  const { data: existing } = await supabase
    .from("projects")
    .select("id, dir_index")
    .eq("slug", slug)
    .single();

  let dirIndex: number;
  if (existing) {
    dirIndex = existing.dir_index;
  } else {
    const { data: maxRow } = await supabase
      .from("projects")
      .select("dir_index")
      .order("dir_index", { ascending: false })
      .limit(1)
      .single();
    dirIndex = (maxRow?.dir_index ?? 0) + 1;
  }

  console.log(`\n📦 Syncing: ${dirName} (slug: ${slug}, index: ${dirIndex})`);

  // 1. Upload all files to MinIO
  const files = walkDir(projectDir);
  let uploaded = 0;

  for (const file of files) {
    const localPath = path.join(projectDir, file);
    const minioKey = `${minioPrefix}/${file}`;
    const content = fs.readFileSync(localPath);
    const contentType = getMimeType(file);

    await uploadFile(minioKey, content, contentType);
    uploaded++;
    process.stdout.write(`  ↑ Uploaded ${uploaded}/${files.length} files\r`);
  }
  console.log(`  ✅ Uploaded ${uploaded} files to MinIO`);

  // 2. Parse meta.yml
  const metaPath = path.join(projectDir, "en", "meta.yml");
  if (!fs.existsSync(metaPath)) {
    console.log(`  ⚠️  No meta.yml found, skipping DB sync`);
    return;
  }

  const metaRaw = fs.readFileSync(metaPath, "utf-8");
  const meta = load(metaRaw) as ProjectMeta;

  // 3. Upsert project to Supabase
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .single();

  const projectData = {
    slug,
    dir_name: dirName,
    dir_index: dirIndex,
    title: meta.title,
    hero_image: meta.hero_image ?? null,
    description: typeof meta.description === "string" ? meta.description : null,
    meta_title: meta.meta_title ?? null,
    meta_description: meta.meta_description ?? null,
    pdf: meta.pdf ?? null,
    listed: meta.listed ?? true,
    copyedit: meta.copyedit ?? false,
    last_tested: meta.last_tested ?? null,
    version: meta.version ?? null,
    updated_at: new Date().toISOString(),
  };

  let projectId: string;

  if (existingProject) {
    const { data } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", existingProject.id)
      .select("id")
      .single();
    projectId = data!.id;
    console.log(`  📝 Updated project in DB`);
  } else {
    const { data } = await supabase
      .from("projects")
      .insert(projectData)
      .select("id")
      .single();
    projectId = data!.id;
    console.log(`  🆕 Created project in DB`);
  }

  // 4. Sync steps
  const steps = meta.steps ?? [];

  // Delete existing steps first
  await supabase.from("steps").delete().eq("project_id", projectId);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNumber = i + 1;
    const hasQuiz = !!step.knowledge_quiz;

    await supabase.from("steps").insert({
      project_id: projectId,
      step_number: stepNumber,
      title: step.title,
      completion: step.completion ?? null,
      has_quiz: hasQuiz,
      quiz_path: step.knowledge_quiz?.path ?? null,
      quiz_version: step.knowledge_quiz?.version ?? null,
      quiz_questions: step.knowledge_quiz?.questions ?? null,
      quiz_passing_score: step.knowledge_quiz?.passing_score ?? null,
      is_challenge: (step as StepEntry & { challenge?: boolean }).challenge ?? false,
    });
  }
  console.log(`  📝 Synced ${steps.length} steps`);

  // 5. Sync assets
  const assetFiles = files.filter((f) => !f.endsWith(".md") && !f.endsWith(".yml"));

  // Delete existing assets first
  await supabase.from("assets").delete().eq("project_id", projectId);

  for (const file of assetFiles) {
    const stat = fs.statSync(path.join(projectDir, file));
    const minioKey = `${minioPrefix}/${file}`;
    const fileName = path.basename(file);

    await supabase.from("assets").insert({
      project_id: projectId,
      file_path: file,
      file_name: fileName,
      mime_type: getMimeType(file),
      size: stat.size,
      minio_key: minioKey,
    });
  }
  console.log(`  📝 Synced ${assetFiles.length} assets`);
}

function resolveDirectories(filter?: string): string[] {
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const directories = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => {
      const parsedA = parseProjectDir(a);
      const parsedB = parseProjectDir(b);
      return (parsedA?.index ?? 0) - (parsedB?.index ?? 0);
    });

  if (!filter) return directories;

  // Match by slug (e.g. "music-maker") or dir name (e.g. "1.space-talk")
  const matched = directories.filter((dir) => {
    const parsed = parseProjectDir(dir);
    const slug = parsed?.name ?? dir;
    return slug === filter || dir === filter;
  });

  if (matched.length === 0) {
    console.error(`❌ Project not found: "${filter}"`);
    console.error(`   Available: ${directories.map((d) => parseProjectDir(d)?.name ?? d).join(", ")}`);
    process.exit(1);
  }

  return matched;
}

async function main() {
  const filter = process.argv[2];
  const label = filter ? `"${filter}"` : "all";

  console.log(`🚀 Starting sync to MinIO + Supabase (${label})\n`);

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error("❌ projects/ directory not found");
    process.exit(1);
  }

  const directories = resolveDirectories(filter);
  console.log(`Found ${directories.length} project(s) to sync`);

  for (const dirName of directories) {
    await syncProject(dirName);
  }

  console.log("\n✅ Sync complete!");
}

main().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
