import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { createProject } from "@/lib/projects-db-write";
import { getAllProjects } from "@/lib/projects";

export async function GET() {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to list projects: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const { projectId, meta } = body;

    if (!projectId || !meta?.title) {
      return NextResponse.json(
        { error: "projectId and meta.title are required" },
        { status: 400 }
      );
    }

    const result = await createProject(projectId, meta);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, directoryName: result.directoryName }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
