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
    const { categoryIds } = body as { categoryIds: string[] };

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "categoryIds must be an array" },
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

    await prisma.projectCategory.deleteMany({
      where: { projectId: project.id },
    });

    if (categoryIds.length > 0) {
      await prisma.projectCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          projectId: project.id,
          categoryId,
        })),
      });
    }

    invalidateProjectCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update project categories" },
      { status: 500 }
    );
  }
}
