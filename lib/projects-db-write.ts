import { createServerSupabase } from "./supabase-server";
import type { ProjectMeta } from "./types";

interface DbStep {
  id: number;
  step_number: number;
}

export async function createProject(
  projectId: string,
  meta: Omit<ProjectMeta, "steps"> & { steps: { title: string }[] }
): Promise<{ success: true; directoryName: string } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (existing) {
    return { success: false, error: `Project "${projectId}" already exists` };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: maxSort } = await (supabase as any)
    .from("projects")
    .select("sort_index")
    .order("sort_index", { ascending: false })
    .limit(1)
    .single();

  const sortIndex = (maxSort?.sort_index ?? 0) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: projError } = await (supabase as any)
    .from("projects")
    .insert({
      id: projectId,
      sort_index: sortIndex,
      title: meta.title,
      hero_image: meta.hero_image ?? "images/banner.png",
      description: meta.description ?? "",
      meta_title: meta.meta_title ?? null,
      meta_description: meta.meta_description ?? null,
      pdf: meta.pdf ?? null,
      listed: meta.listed ?? true,
      copyedit: meta.copyedit ?? false,
      last_tested: meta.last_tested ?? new Date().toISOString().slice(0, 10),
      version: null,
    });

  if (projError) {
    return { success: false, error: projError.message };
  }

  const stepInserts = meta.steps.map((s, i) => ({
    project_id: projectId,
    step_number: i + 1,
    title: s.title,
    content: `## ${s.title}\n\n`,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: stepError } = await (supabase as any)
    .from("steps")
    .insert(stepInserts);

  if (stepError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("projects").delete().eq("id", projectId);
    return { success: false, error: stepError.message };
  }

  return { success: true, directoryName: `${sortIndex}.${projectId}` };
}

export async function updateProjectMeta(
  projectId: string,
  meta: ProjectMeta
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: projError } = await (supabase as any)
    .from("projects")
    .update({
      title: meta.title,
      hero_image: meta.hero_image,
      description: meta.description,
      meta_title: meta.meta_title ?? null,
      meta_description: meta.meta_description ?? null,
      pdf: meta.pdf ?? null,
      listed: meta.listed,
      copyedit: meta.copyedit,
      last_tested: meta.last_tested,
      version: meta.version ?? null,
    })
    .eq("id", projectId);

  if (projError) {
    return { success: false, error: projError.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingSteps } = await (supabase as any)
    .from("steps")
    .select("id, step_number")
    .eq("project_id", projectId)
    .order("step_number", { ascending: true });

  const existingCount = (existingSteps as DbStep[])?.length ?? 0;
  const newCount = meta.steps.length;

  for (let i = 0; i < newCount; i++) {
    const stepNumber = i + 1;
    const existing = (existingSteps as DbStep[])?.find((s) => s.step_number === stepNumber);

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("steps")
        .update({ title: meta.steps[i].title })
        .eq("id", existing.id);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("steps")
        .insert({
          project_id: projectId,
          step_number: stepNumber,
          title: meta.steps[i].title,
          content: `## ${meta.steps[i].title}\n\n`,
        });
    }
  }

  if (existingSteps && existingCount > newCount) {
    const toDelete = (existingSteps as DbStep[]).filter((s) => s.step_number > newCount);
    for (const step of toDelete) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("steps").delete().eq("id", step.id);
    }
  }

  return { success: true };
}

export async function updateStep(
  projectId: string,
  stepIndex: number,
  content: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("steps")
    .select("id")
    .eq("project_id", projectId)
    .eq("step_number", stepIndex)
    .single();

  if (!existing) {
    return { success: false, error: `Step ${stepIndex} not found` };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("steps")
    .update({ content })
    .eq("id", (existing as { id: number }).id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function addStep(
  projectId: string,
  title: string
): Promise<{ success: true; stepIndex: number } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: maxStep } = await (supabase as any)
    .from("steps")
    .select("step_number")
    .eq("project_id", projectId)
    .order("step_number", { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (maxStep?.step_number ?? 0) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("steps")
    .insert({
      project_id: projectId,
      step_number: nextNumber,
      title,
      content: `## ${title}\n\n`,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, stepIndex: nextNumber };
}

export async function removeStep(
  projectId: string,
  stepIndex: number
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from("steps")
    .delete()
    .eq("project_id", projectId)
    .eq("step_number", stepIndex);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: remaining } = await (supabase as any)
    .from("steps")
    .select("id, step_number")
    .eq("project_id", projectId)
    .order("step_number", { ascending: true });

  if (remaining) {
    for (let i = 0; i < (remaining as DbStep[]).length; i++) {
      const newNumber = i + 1;
      if ((remaining as DbStep[])[i].step_number !== newNumber) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("steps")
          .update({ step_number: newNumber })
          .eq("id", (remaining as DbStep[])[i].id);
      }
    }
  }

  return { success: true };
}
