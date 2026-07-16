import { NextResponse } from "next/server";
import { addStep } from "@/lib/projects-db-write";
import { getProjectMeta } from "@/lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const meta = await getProjectMeta(projectId);

    if (!meta) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ steps: meta.steps ?? [] });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const result = await addStep(projectId, title);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, stepIndex: result.stepIndex }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add step" }, { status: 500 });
  }
}
