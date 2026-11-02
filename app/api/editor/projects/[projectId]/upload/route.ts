import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, getMimeType } from "@/lib/minio";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  try {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { slug: projectId },
      select: { id: true, dirName: true },
    });

    if (!project) {
      return NextResponse.json({ error: `Project "${projectId}" not found` }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitize filename
    const originalName = file.name;
    const sanitizedFileName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const mimeType = file.type || getMimeType(sanitizedFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // MinIO storage keys (upload to both id and en to support all locales)
    const minioKeyId = `projects/${project.dirName}/id/images/${sanitizedFileName}`;
    const minioKeyEn = `projects/${project.dirName}/en/images/${sanitizedFileName}`;
    const filePath = `images/${sanitizedFileName}`;

    // Upload to MinIO
    await Promise.all([
      uploadFile(minioKeyId, buffer, mimeType),
      uploadFile(minioKeyEn, buffer, mimeType),
    ]);

    // Save asset record in database
    const asset = await prisma.asset.upsert({
      where: {
        projectId_filePath: {
          projectId: project.id,
          filePath,
        },
      },
      update: {
        fileName: sanitizedFileName,
        mimeType,
        size: BigInt(file.size),
        minioKey: minioKeyId,
      },
      create: {
        projectId: project.id,
        filePath,
        fileName: sanitizedFileName,
        mimeType,
        size: BigInt(file.size),
        minioKey: minioKeyId,
      },
    });

    return NextResponse.json({
      success: true,
      fileName: sanitizedFileName,
      filePath,
      url: `/api/assets/${projectId}/${filePath}`,
      size: Number(asset.size || 0),
      mimeType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
