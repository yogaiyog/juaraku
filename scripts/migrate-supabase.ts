/**
 * Migrate data from Supabase REST API to local PostgreSQL via Prisma
 *
 * Usage: npx tsx scripts/migrate-supabase.ts
 */
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = "https://vcxwcifgnyipkgjgdmgb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeHdjaWZnbnlpcGtnamdkbWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTg2MjEsImV4cCI6MjA5OTU5NDYyMX0.B1wC7nQAGCk4ecLEMrDVNaPoxkmlSVs8nM82wMIRsuo";

const prisma = new PrismaClient();

async function fetchSupabase<T>(
  table: string,
  order?: string
): Promise<T[]> {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (order) {
    url += `&order=${order}`;
  }
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${table}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

interface SupabaseProject {
  id: string;
  slug: string;
  dir_name: string;
  dir_index: number;
  title: string;
  hero_image: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  pdf: string | null;
  listed: boolean;
  copyedit: boolean;
  last_tested: string | null;
  version: number | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseStep {
  id: string;
  project_id: string;
  step_number: number;
  title: string;
  completion: unknown;
  has_quiz: boolean;
  quiz_path: string | null;
  quiz_version: number | null;
  quiz_questions: number | null;
  quiz_passing_score: number | null;
  is_challenge: boolean;
  created_at: string;
}

interface SupabaseAsset {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number | null;
  minio_key: string;
  created_at: string;
}

interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface SupabaseProjectCategory {
  project_id: string;
  category_id: string;
}

interface SupabasePath {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

interface SupabaseProjectPath {
  project_id: string;
  path_id: string;
  path_index: number;
}

async function main() {
  console.log("🚀 Starting migration from Supabase to local PostgreSQL...\n");

  // 1. Fetch all data from Supabase
  console.log("📥 Fetching data from Supabase...");

  const projects = await fetchSupabase<SupabaseProject>("projects", "created_at.asc");
  console.log(`   ✓ projects: ${projects.length} rows`);

  const steps = await fetchSupabase<SupabaseStep>("steps", "created_at.asc");
  console.log(`   ✓ steps: ${steps.length} rows`);

  const assets = await fetchSupabase<SupabaseAsset>("assets", "created_at.asc");
  console.log(`   ✓ assets: ${assets.length} rows`);

  const categories = await fetchSupabase<SupabaseCategory>("categories", "created_at.asc");
  console.log(`   ✓ categories: ${categories.length} rows`);

  const projectCategories = await fetchSupabase<SupabaseProjectCategory>(
    "project_categories"
  );
  console.log(`   ✓ project_categories: ${projectCategories.length} rows`);

  const paths = await fetchSupabase<SupabasePath>("paths", "created_at.asc");
  console.log(`   ✓ paths: ${paths.length} rows`);

  const projectPaths = await fetchSupabase<SupabaseProjectPath>("project_paths");
  console.log(`   ✓ project_paths: ${projectPaths.length} rows`);

  // 2. Clear existing data (in reverse order of foreign keys)
  console.log("\n🗑️  Clearing existing data...");

  await prisma.projectPath.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.step.deleteMany();
  await prisma.project.deleteMany();
  await prisma.path.deleteMany();
  await prisma.category.deleteMany();
  console.log("   ✓ Cleared all existing data");

  // 3. Insert data (in order of foreign keys)
  console.log("\n📤 Inserting data into local PostgreSQL...");

  // Categories
  await prisma.category.createMany({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: new Date(c.created_at),
    })),
  });
  console.log(`   ✓ categories: ${categories.length} rows inserted`);

  // Paths
  await prisma.path.createMany({
    data: paths.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      createdAt: new Date(p.created_at),
    })),
  });
  console.log(`   ✓ paths: ${paths.length} rows inserted`);

  // Projects
  await prisma.project.createMany({
    data: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      dirName: p.dir_name,
      dirIndex: p.dir_index,
      title: p.title,
      heroImage: p.hero_image,
      description: p.description,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      pdf: p.pdf,
      listed: p.listed,
      copyedit: p.copyedit,
      lastTested: p.last_tested ? new Date(p.last_tested) : null,
      version: p.version,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    })),
  });
  console.log(`   ✓ projects: ${projects.length} rows inserted`);

  // Steps (batch insert for performance)
  const STEPS_BATCH_SIZE = 50;
  for (let i = 0; i < steps.length; i += STEPS_BATCH_SIZE) {
    const batch = steps.slice(i, i + STEPS_BATCH_SIZE);
    await prisma.step.createMany({
      data: batch.map((s) => ({
        id: s.id,
        projectId: s.project_id,
        stepNumber: s.step_number,
        title: s.title,
        completion: s.completion ?? undefined,
        hasQuiz: s.has_quiz,
        quizPath: s.quiz_path,
        quizVersion: s.quiz_version,
        quizQuestions: s.quiz_questions,
        quizPassingScore: s.quiz_passing_score,
        isChallenge: s.is_challenge,
        createdAt: new Date(s.created_at),
      })),
    });
    process.stdout.write(
      `   ✓ steps: ${Math.min(i + STEPS_BATCH_SIZE, steps.length)}/${steps.length} rows inserted\r`
    );
  }
  console.log(`\n   ✓ steps: ${steps.length} rows inserted`);

  // Assets (batch insert for performance)
  const ASSETS_BATCH_SIZE = 100;
  for (let i = 0; i < assets.length; i += ASSETS_BATCH_SIZE) {
    const batch = assets.slice(i, i + ASSETS_BATCH_SIZE);
    await prisma.asset.createMany({
      data: batch.map((a) => ({
        id: a.id,
        projectId: a.project_id,
        filePath: a.file_path,
        fileName: a.file_name,
        mimeType: a.mime_type,
        size: a.size ? BigInt(a.size) : null,
        minioKey: a.minio_key,
        createdAt: new Date(a.created_at),
      })),
    });
    process.stdout.write(
      `   ✓ assets: ${Math.min(i + ASSETS_BATCH_SIZE, assets.length)}/${assets.length} rows inserted\r`
    );
  }
  console.log(`\n   ✓ assets: ${assets.length} rows inserted`);

  // Project Categories
  await prisma.projectCategory.createMany({
    data: projectCategories.map((pc) => ({
      projectId: pc.project_id,
      categoryId: pc.category_id,
    })),
  });
  console.log(
    `   ✓ project_categories: ${projectCategories.length} rows inserted`
  );

  // Project Paths
  await prisma.projectPath.createMany({
    data: projectPaths.map((pp) => ({
      projectId: pp.project_id,
      pathId: pp.path_id,
      pathIndex: pp.path_index,
    })),
  });
  console.log(`   ✓ project_paths: ${projectPaths.length} rows inserted`);

  // 4. Summary
  console.log("\n✅ Migration complete!");
  console.log("\n📊 Summary:");
  console.log(`   - ${projects.length} projects`);
  console.log(`   - ${steps.length} steps`);
  console.log(`   - ${assets.length} assets`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${projectCategories.length} project-category links`);
  console.log(`   - ${paths.length} paths`);
  console.log(`   - ${projectPaths.length} project-path links`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
