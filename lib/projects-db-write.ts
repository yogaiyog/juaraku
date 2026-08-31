import { prisma } from "./prisma";
import type { ProjectMeta } from "./types";

async function getProjectIdBySlug(slug: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  });
  return project?.id ?? null;
}

export async function createProject(
  projectId: string,
  meta: Omit<ProjectMeta, "steps"> & { steps: { title: string }[] }
): Promise<{ success: true; directoryName: string } | { success: false; error: string }> {
  const existing = await prisma.project.findUnique({
    where: { slug: projectId },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: `Project "${projectId}" already exists` };
  }

  const maxSort = await prisma.project.findFirst({
    orderBy: { dirIndex: "desc" },
    select: { dirIndex: true },
  });

  const sortIndex = (maxSort?.dirIndex ?? 0) + 1;

  try {
    const newProject = await prisma.project.create({
      data: {
        slug: projectId,
        dirIndex: sortIndex,
        dirName: `${sortIndex}.${projectId}`,
        title: meta.title,
        heroImage: meta.hero_image ?? "images/banner.png",
        description: meta.description ?? "",
        metaTitle: meta.meta_title ?? null,
        metaDescription: meta.meta_description ?? null,
        pdf: meta.pdf ?? null,
        listed: meta.listed ?? true,
        copyedit: meta.copyedit ?? false,
        lastTested: meta.last_tested
          ? new Date(meta.last_tested)
          : new Date(),
        version: null,
      },
      select: { id: true },
    });

    const stepInserts = meta.steps.map((s, i) => ({
      projectId: newProject.id,
      stepNumber: i + 1,
      title: s.title,
      content: `## ${s.title}\n\n`,
    }));

    await prisma.step.createMany({ data: stepInserts });

    return { success: true, directoryName: `${sortIndex}.${projectId}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

export async function updateProjectMeta(
  projectId: string,
  meta: ProjectMeta
): Promise<{ success: true } | { success: false; error: string }> {
  const uuid = await getProjectIdBySlug(projectId);
  if (!uuid) return { success: false, error: `Project "${projectId}" not found` };

  try {
    await prisma.project.update({
      where: { id: uuid },
      data: {
        title: meta.title,
        heroImage: meta.hero_image,
        description: meta.description,
        metaTitle: meta.meta_title ?? null,
        metaDescription: meta.meta_description ?? null,
        pdf: meta.pdf ?? null,
        listed: meta.listed,
        copyedit: meta.copyedit,
        lastTested: meta.last_tested ? new Date(meta.last_tested) : null,
        version: meta.version ?? null,
      },
    });

    const existingSteps = await prisma.step.findMany({
      where: { projectId: uuid },
      select: { id: true, stepNumber: true },
      orderBy: { stepNumber: "asc" },
    });

    const existingCount = existingSteps.length;
    const newCount = meta.steps.length;

    for (let i = 0; i < newCount; i++) {
      const stepNumber = i + 1;
      const existing = existingSteps.find((s) => s.stepNumber === stepNumber);

      if (existing) {
        await prisma.step.update({
          where: { id: existing.id },
          data: { title: meta.steps[i].title },
        });
      } else {
        await prisma.step.create({
          data: {
            projectId: uuid,
            stepNumber,
            title: meta.steps[i].title,
            content: `## ${meta.steps[i].title}\n\n`,
          },
        });
      }
    }

    if (existingCount > newCount) {
      const toDelete = existingSteps.filter((s) => s.stepNumber > newCount);
      for (const step of toDelete) {
        await prisma.step.delete({ where: { id: step.id } });
      }
    }

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

export async function updateStep(
  projectId: string,
  stepIndex: number,
  content: string
): Promise<{ success: true } | { success: false; error: string }> {
  const project = await prisma.project.findUnique({
    where: { slug: projectId },
    select: { id: true, dirName: true },
  });
  if (!project) return { success: false, error: `Project "${projectId}" not found` };

  const existing = await prisma.step.findUnique({
    where: {
      projectId_stepNumber: {
        projectId: project.id,
        stepNumber: stepIndex,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: `Step ${stepIndex} not found` };
  }

  await prisma.step.update({
    where: { id: existing.id },
    data: { content },
  });

  // Sync to MinIO in background for both id and en
  try {
    const { uploadFile } = await import("./minio");
    const buffer = Buffer.from(content, "utf-8");
    const keyId = `projects/${project.dirName}/id/step_${stepIndex}.md`;
    const keyEn = `projects/${project.dirName}/en/step_${stepIndex}.md`;
    await Promise.all([
      uploadFile(keyId, buffer, "text/markdown"),
      uploadFile(keyEn, buffer, "text/markdown"),
    ]);
  } catch (e) {
    console.error("Failed to sync step to MinIO:", e);
  }

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.project.delete({
      where: { slug: projectId },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

export async function addStep(
  projectId: string,
  title: string
): Promise<{ success: true; stepIndex: number } | { success: false; error: string }> {
  const uuid = await getProjectIdBySlug(projectId);
  if (!uuid) return { success: false, error: `Project "${projectId}" not found` };

  const maxStep = await prisma.step.findFirst({
    where: { projectId: uuid },
    orderBy: { stepNumber: "desc" },
    select: { stepNumber: true },
  });

  const nextNumber = (maxStep?.stepNumber ?? 0) + 1;

  try {
    await prisma.step.create({
      data: {
        projectId: uuid,
        stepNumber: nextNumber,
        title,
        content: `## ${title}\n\n`,
      },
    });
    return { success: true, stepIndex: nextNumber };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

export async function removeStep(
  projectId: string,
  stepIndex: number
): Promise<{ success: true } | { success: false; error: string }> {
  const uuid = await getProjectIdBySlug(projectId);
  if (!uuid) return { success: false, error: `Project "${projectId}" not found` };

  try {
    await prisma.step.delete({
      where: {
        projectId_stepNumber: {
          projectId: uuid,
          stepNumber: stepIndex,
        },
      },
    });

    const remaining = await prisma.step.findMany({
      where: { projectId: uuid },
      select: { id: true, stepNumber: true },
      orderBy: { stepNumber: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      const newNumber = i + 1;
      if (remaining[i].stepNumber !== newNumber) {
        await prisma.step.update({
          where: { id: remaining[i].id },
          data: { stepNumber: newNumber },
        });
      }
    }

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}
