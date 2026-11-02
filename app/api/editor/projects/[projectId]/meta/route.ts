import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { updateProjectMeta } from "@/lib/projects-db-write";
import { getProjectMeta } from "@/lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  const { projectId } = await params;

  try {
    const meta = await getProjectMeta(projectId);

    if (!meta) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(meta);
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  const { projectId } = await params;

  try {
    const body = await req.json();
    const result = await updateProjectMeta(projectId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update metadata" }, { status: 500 });
  }
}
