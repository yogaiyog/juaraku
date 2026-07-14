import { NextResponse } from "next/server";
import { updateStep, removeStep } from "@/lib/projects-write";
import { getStepContent } from "@/lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; stepIndex: string }> }
) {
  const { projectId, stepIndex } = await params;
  const idx = Number.parseInt(stepIndex, 10);

  const content = await getStepContent(projectId, idx);
  if (content === null) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  return NextResponse.json({ stepIndex: idx, content });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string; stepIndex: string }> }
) {
  const { projectId, stepIndex } = await params;
  const idx = Number.parseInt(stepIndex, 10);

  try {
    const body = await req.json();
    const { content } = body;

    if (content === undefined) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await updateStep(projectId, idx, content);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update step" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; stepIndex: string }> }
) {
  const { projectId, stepIndex } = await params;
  const idx = Number.parseInt(stepIndex, 10);

  const result = await removeStep(projectId, idx);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
