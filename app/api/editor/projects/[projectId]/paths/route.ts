import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateProjectCache } from "@/lib/projects";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pathIds } = body as { pathIds: string[] };

    if (!Array.isArray(pathIds)) {
      return NextResponse.json(
        { error: "pathIds must be an array" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { slug: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.projectPath.deleteMany({
      where: { projectId: project.id },
    });

    if (pathIds.length > 0) {
      await prisma.projectPath.createMany({
        data: pathIds.map((pathId, index) => ({
          projectId: project.id,
          pathId,
          pathIndex: index,
        })),
      });
    }

    invalidateProjectCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update project paths" },
      { status: 500 }
    );
  }
}
