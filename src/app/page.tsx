export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAssets } from "@/components/dashboard/RecentAssets";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalCount, byStatus, soldFinancials, totalValue, recent] = await Promise.all([
    prisma.asset.count({ where: { parentId: null } }),
    prisma.asset.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { parentId: null },
    }),
    prisma.asset.aggregate({
      _sum: { purchasePrice: true, salePrice: true },
      where: { status: "SOLD", parentId: null },
    }),
    prisma.asset.aggregate({
      _sum: { purchasePrice: true },
      where: { parentId: null },
    }),
    prisma.asset.findMany({
      where: { parentId: null },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const lostCount =
    byStatus.find((s) => s.status === "LOST")?._count._all ?? 0;
  const soldCount =
    byStatus.find((s) => s.status === "SOLD")?._count._all ?? 0;

  const profitLoss =
    (soldFinancials._sum.salePrice ?? 0) - (soldFinancials._sum.purchasePrice ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your tracked assets</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={totalCount}
          icon={Package}
          subtitle={`${soldCount} sold`}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(totalValue._sum.purchasePrice)}
          icon={DollarSign}
          subtitle="Purchase cost"
        />
        <StatCard
          title="Realized P/L"
          value={formatCurrency(profitLoss)}
          icon={TrendingUp}
          variant={profitLoss > 0 ? "positive" : profitLoss < 0 ? "negative" : "default"}
          subtitle="On sold assets"
        />
        <StatCard
          title="Lost Assets"
          value={lostCount}
          icon={AlertTriangle}
          variant={lostCount > 0 ? "warning" : "default"}
          subtitle="Reported lost"
        />
      </div>

      <RecentAssets assets={recent} />
    </div>
  );
}
