import { prisma } from "@/lib/prisma";
import { AssetForm } from "@/components/assets/AssetForm";

export const metadata = {
  title: "Add Asset — Asset Tracker",
};

interface Props {
  searchParams: Promise<{ parentId?: string }>;
}

export default async function NewAssetPage({ searchParams }: Props) {
  const { parentId } = await searchParams;

  let parentName: string | undefined;
  if (parentId) {
    const parent = await prisma.asset.findUnique({
      where: { id: parentId },
      select: { name: true },
    });
    parentName = parent?.name;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Asset</h1>
        <p className="text-sm text-muted-foreground mt-1">Track a new asset</p>
      </div>
      <AssetForm parentId={parentId} parentName={parentName} />
    </div>
  );
}
