/**
 * Sync step content and certificate from MinIO to database
 *
 * Usage:
 *   npm run sync-content                          → sync all projects
 *   npm run sync-content -- space-talk            → sync single project by slug
 */
import { prisma } from "../lib/prisma";
import { getFileText } from "../lib/minio";

async function main() {
  const filter = process.argv[2];

  const projects = await prisma.project.findMany({
    where: filter ? { slug: filter } : undefined,
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
    },
    orderBy: { dirIndex: "asc" },
  });

  if (projects.length === 0) {
    console.error(filter ? `Project "${filter}" not found` : "No projects found");
    process.exit(1);
  }

  if (filter) {
    console.log(`Syncing: "${filter}"\n`);
  } else {
    console.log(`Syncing ${projects.length} projects\n`);
  }

  let totalSteps = 0;
  let totalCerts = 0;
  let stepErrors = 0;
  let certErrors = 0;

  for (const project of projects) {
    const dirName = project.dirName;
    console.log(`  ${project.slug} (${dirName})`);

    // Sync step content (prefer id, fallback to en)
    for (const step of project.steps) {
      let minioKey = `projects/${dirName}/id/step_${step.stepNumber}.md`;
      let content = await getFileText(minioKey);

      if (content === null) {
        minioKey = `projects/${dirName}/en/step_${step.stepNumber}.md`;
        content = await getFileText(minioKey);
      }

      if (content !== null) {
        await prisma.step.update({
          where: { id: step.id },
          data: { content },
        });
        totalSteps++;
        process.stdout.write(`    step ${step.stepNumber} ✓ (${minioKey.includes("/id/") ? "id" : "en"})\n`);
      } else {
        stepErrors++;
        process.stdout.write(`    step ${step.stepNumber} ⚠️  not found in MinIO\n`);
      }
    }

    // Sync certificate
    const certKey = `projects/${dirName}/LICENCE.md`;
    const certContent = await getFileText(certKey);

    if (certContent !== null) {
      await prisma.project.update({
        where: { id: project.id },
        data: { certificate: certContent },
      });
      totalCerts++;
      process.stdout.write(`    certificate ✓\n`);
    } else {
      certErrors++;
      process.stdout.write(`    certificate ⚠️  not found in MinIO\n`);
    }

    console.log();
  }

  console.log("── Summary ──────────────────────");
  console.log(`  Steps updated:      ${totalSteps}`);
  console.log(`  Certificates saved: ${totalCerts}`);
  if (stepErrors > 0) console.log(`  Steps skipped:      ${stepErrors}`);
  if (certErrors > 0) console.log(`  Certificates skipped: ${certErrors}`);
  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error("Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
