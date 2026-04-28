export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSV } from "@/lib/csv";

type ImportError = { row: number; error: string };

function parseDate(val: string): Date | null {
  if (!val.trim()) return null;
  // Append noon local time so YYYY-MM-DD doesn't shift by timezone
  const d = new Date(val.trim().length === 10 ? `${val.trim()}T12:00:00` : val.trim());
  return isNaN(d.getTime()) ? null : d;
}

function parseNum(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV must contain a header row and at least one data row" },
      { status: 400 }
    );
  }

  const [headerRow, ...dataRows] = rows;

  // Map column names to indices (case-insensitive, trimmed)
  const headers = headerRow.map((h) => h.toLowerCase().trim());
  const col = (name: string) => headers.indexOf(name.toLowerCase().trim());

  const imported: number[] = [];
  const errors: ImportError[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-based, accounting for header
    const get = (colName: string) => (row[col(colName)] ?? "").trim();

    const name = get("name");
    if (!name) {
      errors.push({ row: rowNum, error: "Name is required" });
      continue;
    }

    const statusRaw = get("status").toUpperCase();
    const status = (["ACTIVE", "SOLD", "LOST"].includes(statusRaw)
      ? statusRaw
      : "ACTIVE") as "ACTIVE" | "SOLD" | "LOST";

    const quantity = parseInt(get("quantity")) || 1;
    const purchasePrice = parseNum(get("purchase price"));
    const salePrice = parseNum(get("sale price"));
    const purchaseDate = parseDate(get("purchase date"));
    const saleDate = parseDate(get("sale date"));
    const warrantyExpiry = parseDate(get("warranty expiry"));

    try {
      await prisma.asset.create({
        data: {
          name,
          manufacturer: get("manufacturer") || null,
          modelNumber: get("model number") || null,
          serialNumber: get("serial number") || null,
          purchaseDate,
          purchasePrice,
          purchaseLocation: get("purchase location") || null,
          quantity,
          url: get("url") || null,
          status,
          salePrice: status === "SOLD" ? salePrice : null,
          saleDate: status === "SOLD" ? saleDate : null,
          warrantyExpiry,
          warrantyNotes: get("warranty notes") || null,
          notes: get("notes") || null,
        },
      });
      imported.push(rowNum);
    } catch {
      errors.push({ row: rowNum, error: "Failed to save asset" });
    }
  }

  return NextResponse.json({ imported: imported.length, errors });
}
