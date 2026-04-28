import type { Asset } from "@/generated/prisma/client";

const HEADERS = [
  "ID",
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
  "Profit/Loss",
  "Notes",
  "Created At",
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
  const rows = assets.map((a) => {
    const profitLoss =
      a.salePrice != null && a.purchasePrice != null
        ? (a.salePrice - a.purchasePrice).toFixed(2)
        : "";
    return [
      a.id,
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
      profitLoss,
      a.notes,
      new Date(a.createdAt).toISOString(),
    ]
      .map(escapeCSV)
      .join(",");
  });
  return [HEADERS.join(","), ...rows].join("\r\n");
}
