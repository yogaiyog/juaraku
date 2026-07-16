import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidatePathCache, invalidateProjectCache } from "@/lib/projects";

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
    const { name, description, projectIds } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Path name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await prisma.path.update({
      where: { id: pathId },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    if (Array.isArray(projectIds)) {
      await prisma.projectPath.deleteMany({ where: { pathId } });
      if (projectIds.length > 0) {
        await prisma.projectPath.createMany({
          data: projectIds.map((pid: string, index: number) => ({
            pathId,
            projectId: pid,
            pathIndex: index,
          })),
        });
      }
    }

    invalidatePathCache();
    invalidateProjectCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update path" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  const { pathId } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.path.delete({
      where: { id: pathId },
    });

    invalidatePathCache();
    invalidateProjectCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete path" },
      { status: 500 }
    );
  }
}
