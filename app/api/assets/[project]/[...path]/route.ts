import { NextResponse } from "next/server";
import { getFile, getMimeType } from "@/lib/minio";
import { resolveProjectAsset } from "@/lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string; path: string[] }> }
) {
  const { project, path: filePath } = await params;
  const minioKey = await resolveProjectAsset(project, filePath.join("/"));

  const buffer = await getFile(minioKey);
  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = getMimeType(filePath.join("/"));

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
