import { NextResponse } from "next/server";
import { getFile, getMimeType } from "@/lib/minio";
import { getProjectDir } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string; path: string[] }> }
) {
  const { project, path: pathSegments } = await params;
  const relPath = pathSegments.join("/");
  const dirName = await getProjectDir(project);

  // 1. Try resolving from Asset database record if exists
  let buffer: Uint8Array | null = null;

  try {
    const asset = await prisma.asset.findFirst({
      where: {
        project: { slug: project },
        filePath: relPath,
      },
      select: { minioKey: true },
    });
    if (asset?.minioKey) {
      buffer = await getFile(asset.minioKey);
    }
  } catch {}

  // 2. Candidate paths in MinIO: id/, en/, and root project dir
  if (!buffer) {
    const candidateKeys = [
      `projects/${dirName}/id/${relPath}`,
      `projects/${dirName}/en/${relPath}`,
      `projects/${dirName}/${relPath}`,
    ];

    for (const key of candidateKeys) {
      buffer = await getFile(key);
      if (buffer) break;
    }
  }

  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = getMimeType(relPath);

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
