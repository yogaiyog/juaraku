/**
 * Sync script: Upload local projects/ to MinIO + populate DB via Prisma
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
import { prisma } from "../lib/prisma";
import type { ProjectMeta, StepEntry } from "../lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "projects_backup_local");

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

  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, dirIndex: true },
  });

  let dirIndex: number;
  if (existing) {
    dirIndex = existing.dirIndex;
  } else {
    const maxRow = await prisma.project.findFirst({
      orderBy: { dirIndex: "desc" },
      select: { dirIndex: true },
    });
    dirIndex = (maxRow?.dirIndex ?? 0) + 1;
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

  // 3. Upsert project
  const projectData = {
    slug,
    dirName,
    dirIndex,
    title: meta.title,
    heroImage: meta.hero_image ?? null,
    description: typeof meta.description === "string" ? meta.description : null,
    metaTitle: meta.meta_title ?? null,
    metaDescription: meta.meta_description ?? null,
    pdf: meta.pdf ?? null,
    listed: meta.listed ?? true,
    copyedit: meta.copyedit ?? false,
    lastTested: meta.last_tested ? new Date(meta.last_tested) : null,
    version: meta.version ?? null,
    updatedAt: new Date(),
  };

  let projectId: string;

  if (existing) {
    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: projectData,
      select: { id: true },
    });
    projectId = updated.id;
    console.log(`  📝 Updated project in DB`);
  } else {
    const created = await prisma.project.create({
      data: projectData,
      select: { id: true },
    });
    projectId = created.id;
    console.log(`  🆕 Created project in DB`);
  }

  // 4. Sync steps
  const steps = meta.steps ?? [];

  await prisma.step.deleteMany({ where: { projectId } });

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNumber = i + 1;
    const hasQuiz = !!step.knowledge_quiz;

    await prisma.step.create({
      data: {
        projectId,
        stepNumber,
        title: step.title,
        completion: step.completion ?? undefined,
        hasQuiz,
        quizPath: step.knowledge_quiz?.path ?? null,
        quizVersion: step.knowledge_quiz?.version ?? null,
        quizQuestions: step.knowledge_quiz?.questions ?? null,
        quizPassingScore: step.knowledge_quiz?.passing_score ?? null,
        isChallenge: (step as StepEntry & { challenge?: boolean }).challenge ?? false,
      },
    });
  }
  console.log(`  📝 Synced ${steps.length} steps`);

  // 5. Sync assets
  const assetFiles = files.filter((f) => !f.endsWith(".md") && !f.endsWith(".yml"));

  await prisma.asset.deleteMany({ where: { projectId } });

  for (const file of assetFiles) {
    const stat = fs.statSync(path.join(projectDir, file));
    const minioKey = `${minioPrefix}/${file}`;
    const fileName = path.basename(file);

    await prisma.asset.create({
      data: {
        projectId,
        filePath: file,
        fileName,
        mimeType: getMimeType(file),
        size: BigInt(stat.size),
        minioKey,
      },
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

  const matched = directories.filter((dir) => {
    const parsed = parseProjectDir(dir);
    const slug = parsed?.name ?? dir;
    return slug === filter || dir === filter;
  });

  if (matched.length === 0) {
    console.error(`❌ Project not found: "${filter}"`);
    console.error(
      `   Available: ${directories.map((d) => parseProjectDir(d)?.name ?? d).join(", ")}`
    );
    process.exit(1);
  }

  return matched;
}

async function main() {
  const filter = process.argv[2];
  const label = filter ? `"${filter}"` : "all";

  console.log(`🚀 Starting sync to MinIO + DB (${label})\n`);

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
