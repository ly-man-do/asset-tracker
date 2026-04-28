import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(200, parseInt(searchParams.get("limit") ?? "50"));
  const parentId = searchParams.get("parentId");

  const where: Record<string, unknown> = {
    parentId: parentId === undefined || parentId === null ? null : parentId,
  };

  if (status && ["ACTIVE", "SOLD", "LOST"].includes(status)) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { manufacturer: { contains: q } },
      { modelNumber: { contains: q } },
      { serialNumber: { contains: q } },
      { notes: { contains: q } },
    ];
    delete where.parentId; // search across all when querying
  }

  const validSorts = [
    "name", "manufacturer", "purchasePrice", "purchaseDate", "createdAt", "status", "quantity",
  ];
  const orderField = validSorts.includes(sort) ? sort : "createdAt";

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { [orderField]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { subItems: true, attachments: true } },
      },
    }),
    prisma.asset.count({ where }),
  ]);

  return NextResponse.json({ assets, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, manufacturer, modelNumber, serialNumber, purchaseDate, purchasePrice,
    purchaseLocation, quantity, url, status, salePrice, saleDate, notes,
    warrantyExpiry, warrantyNotes, parentId,
  } = body;

  const asset = await prisma.asset.create({
    data: {
      name,
      manufacturer: manufacturer || null,
      modelNumber: modelNumber || null,
      serialNumber: serialNumber || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice !== "" && purchasePrice != null ? Number(purchasePrice) : null,
      purchaseLocation: purchaseLocation || null,
      quantity: Number(quantity) || 1,
      url: url || null,
      status: status || "ACTIVE",
      salePrice: salePrice !== "" && salePrice != null ? Number(salePrice) : null,
      saleDate: saleDate ? new Date(saleDate) : null,
      notes: notes || null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      warrantyNotes: warrantyNotes || null,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
