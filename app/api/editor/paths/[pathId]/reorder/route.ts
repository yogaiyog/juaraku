import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateProjectCache } from "@/lib/projects";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  const { pathId } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectIds } = body as { projectIds: string[] };

    if (!Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: "projectIds must be an array" },
        { status: 400 }
      );
    }

    const path = await prisma.path.findUnique({
      where: { id: pathId },
      select: { id: true },
    });

    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    for (let i = 0; i < projectIds.length; i++) {
      await prisma.projectPath.upsert({
        where: {
          projectId_pathId: {
            projectId: projectIds[i],
            pathId: path.id,
          },
        },
        update: { pathIndex: i },
        create: {
          projectId: projectIds[i],
          pathId: path.id,
          pathIndex: i,
        },
      });
    }

    invalidateProjectCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reorder projects" },
      { status: 500 }
    );
  }
}
