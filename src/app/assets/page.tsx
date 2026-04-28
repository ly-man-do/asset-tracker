export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AssetTable } from "@/components/assets/AssetTable";

export const metadata = {
  title: "Assets — Asset Tracker",
};

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">All tracked assets</p>
      </div>
      <Suspense>
        <AssetTable />
      </Suspense>
    </div>
  );
}
