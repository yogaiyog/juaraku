import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { resolveProjectAsset } from "@/lib/projects";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".sb3": "application/octet-stream",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string; path: string[] }> }
) {
  const { project, path: filePath } = await params;
  const fullPath = resolveProjectAsset(project, filePath.join("/"));

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const buffer = fs.readFileSync(fullPath);
  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType },
  });
}
