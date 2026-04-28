import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      attachments: { orderBy: { createdAt: "asc" } },
      subItems: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { subItems: true, attachments: true } } },
      },
      parent: { select: { id: true, name: true } },
    },
  });

  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const {
    name, manufacturer, modelNumber, serialNumber, purchaseDate, purchasePrice,
    purchaseLocation, quantity, url, status, salePrice, saleDate, notes,
    warrantyExpiry, warrantyNotes, parentId,
  } = body;

  const asset = await prisma.asset.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      manufacturer: manufacturer !== undefined ? (manufacturer || null) : undefined,
      modelNumber: modelNumber !== undefined ? (modelNumber || null) : undefined,
      serialNumber: serialNumber !== undefined ? (serialNumber || null) : undefined,
      purchaseDate: purchaseDate !== undefined
        ? (purchaseDate ? new Date(purchaseDate) : null)
        : undefined,
      purchasePrice: purchasePrice !== undefined
        ? (purchasePrice !== "" && purchasePrice != null ? Number(purchasePrice) : null)
        : undefined,
      purchaseLocation: purchaseLocation !== undefined ? (purchaseLocation || null) : undefined,
      quantity: quantity !== undefined ? (Number(quantity) || 1) : undefined,
      url: url !== undefined ? (url || null) : undefined,
      status: status !== undefined ? status : undefined,
      salePrice: salePrice !== undefined
        ? (salePrice !== "" && salePrice != null ? Number(salePrice) : null)
        : undefined,
      saleDate: saleDate !== undefined
        ? (saleDate ? new Date(saleDate) : null)
        : undefined,
      notes: notes !== undefined ? (notes || null) : undefined,
      warrantyExpiry: warrantyExpiry !== undefined
        ? (warrantyExpiry ? new Date(warrantyExpiry) : null)
        : undefined,
      warrantyNotes: warrantyNotes !== undefined ? (warrantyNotes || null) : undefined,
      parentId: parentId !== undefined ? (parentId || null) : undefined,
    },
  });

  return NextResponse.json(asset);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const attachments = await prisma.attachment.findMany({ where: { assetId: id } });
  await Promise.all(attachments.map((a) => deleteUpload(a.filename)));

  await prisma.asset.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
