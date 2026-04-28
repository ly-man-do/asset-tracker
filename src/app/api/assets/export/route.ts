import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assetsToCSV } from "@/lib/csv";

export async function GET() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csv = assetsToCSV(assets);
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="assets-${date}.csv"`,
    },
  });
}
