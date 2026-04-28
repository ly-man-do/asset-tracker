import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { attachmentId } = await params;

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteUpload(attachment.filename);
  await prisma.attachment.delete({ where: { id: attachmentId } });

  return new NextResponse(null, { status: 204 });
}
