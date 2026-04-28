import type { Asset } from "@/generated/prisma/client";

export const CSV_HEADERS = [
  "Name",
  "Manufacturer",
  "Model Number",
  "Serial Number",
  "Purchase Date",
  "Purchase Price",
  "Purchase Location",
  "Quantity",
  "URL",
  "Status",
  "Sale Price",
  "Sale Date",
  "Warranty Expiry",
  "Warranty Notes",
  "Notes",
];

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function assetsToCSV(assets: Asset[]): string {
  const rows = assets.map((a) => [
    a.name,
    a.manufacturer,
    a.modelNumber,
    a.serialNumber,
    a.purchaseDate ? new Date(a.purchaseDate).toISOString().split("T")[0] : "",
    a.purchasePrice ?? "",
    a.purchaseLocation,
    a.quantity,
    a.url,
    a.status,
    a.salePrice ?? "",
    a.saleDate ? new Date(a.saleDate).toISOString().split("T")[0] : "",
    a.warrantyExpiry ? new Date(a.warrantyExpiry).toISOString().split("T")[0] : "",
    a.warrantyNotes,
    a.notes,
  ].map(escapeCSV).join(","));

  return [CSV_HEADERS.join(","), ...rows].join("\r\n");
}

/** Parse RFC 4180 CSV text into rows of string arrays. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\r" && next === "\n") {
        row.push(field); field = "";
        rows.push(row); row = []; i++;
      } else if (ch === "\n") {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else { field += ch; }
    }
  }

  // Flush last field/row
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);

  return rows;
}
