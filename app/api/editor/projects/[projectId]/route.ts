import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { deleteProject } from "@/lib/projects-db-write";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  const { projectId } = await params;

  const result = await deleteProject(projectId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
