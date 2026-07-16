import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { slug: projectId },
    select: { certificate: true },
  });

  if (!project || !project.certificate) {
    return NextResponse.json({ html: null }, { status: 404 });
  }

  const html = renderMarkdown(project.certificate);

  return NextResponse.json({ html });
}
