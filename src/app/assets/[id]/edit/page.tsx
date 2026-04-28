import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssetForm } from "@/components/assets/AssetForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({ where: { id }, select: { name: true } });
  return { title: asset ? `Edit ${asset.name} — Asset Tracker` : "Asset Tracker" };
}

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) notFound();

  const defaultValues = {
    name: asset.name,
    manufacturer: asset.manufacturer ?? "",
    modelNumber: asset.modelNumber ?? "",
    serialNumber: asset.serialNumber ?? "",
    purchaseDate: asset.purchaseDate
      ? new Date(asset.purchaseDate).toISOString().split("T")[0]
      : "",
    purchasePrice: asset.purchasePrice ?? undefined,
    purchaseLocation: asset.purchaseLocation ?? "",
    quantity: asset.quantity,
    url: asset.url ?? "",
    status: asset.status,
    salePrice: asset.salePrice ?? undefined,
    saleDate: asset.saleDate
      ? new Date(asset.saleDate).toISOString().split("T")[0]
      : "",
    notes: asset.notes ?? "",
    warrantyExpiry: asset.warrantyExpiry
      ? new Date(asset.warrantyExpiry).toISOString().split("T")[0]
      : "",
    warrantyNotes: asset.warrantyNotes ?? "",
    parentId: asset.parentId ?? undefined,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Asset</h1>
        <p className="text-sm text-muted-foreground mt-1">{asset.name}</p>
      </div>
      <AssetForm assetId={id} defaultValues={defaultValues} />
    </div>
  );
}
