import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const attachments = await prisma.attachment.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({ where: { id }, select: { id: true } });
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const meta = await saveUpload(file);
  const attachment = await prisma.attachment.create({
    data: { assetId: id, ...meta },
  });

  return NextResponse.json(attachment, { status: 201 });
}
