import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Asset } from "@/generated/prisma/client";

interface RecentAssetsProps {
  assets: Asset[];
}

export function RecentAssets({ assets }: RecentAssetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Assets</CardTitle>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No assets yet. Add your first asset to get started.
          </p>
        ) : (
          <div className="space-y-1">
            {assets.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="flex items-center gap-4 rounded-md px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.manufacturer ?? "—"} · Added {formatDate(asset.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">
                    {formatCurrency(asset.purchasePrice)}
                  </span>
                  <StatusBadge status={asset.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
