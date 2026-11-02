import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  try {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { slug: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: `Project "${projectId}" not found` }, { status: 404 });
    }

    const assets = await prisma.asset.findMany({
      where: {
        projectId: project.id,
        OR: [
          { filePath: { startsWith: "images/" } },
          { filePath: { startsWith: "en/images/" } },
          { mimeType: { startsWith: "image/" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = assets.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      filePath: a.filePath.startsWith("en/") ? a.filePath.replace(/^en\//, "") : a.filePath,
      mimeType: a.mimeType,
      size: a.size ? Number(a.size) : null,
      createdAt: a.createdAt,
      url: `/api/assets/${projectId}/${a.filePath.startsWith("en/") ? a.filePath.replace(/^en\//, "") : a.filePath}`,
    }));

    return NextResponse.json({ assets: serialized });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to fetch assets: ${message}` }, { status: 500 });
  }
}
