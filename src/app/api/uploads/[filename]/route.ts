import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getUploadDir } from "@/lib/upload";

export const runtime = "nodejs";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params;

  // Validate against DB to prevent path traversal
  const attachment = await prisma.attachment.findFirst({
    where: { filename },
  });

  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(getUploadDir(), filename);
  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.originalName)}"`,
    },
  });
}
