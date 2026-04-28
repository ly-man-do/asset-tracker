import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { AttachmentList } from "@/components/assets/AttachmentList";
import { SubItemList } from "@/components/assets/SubItemList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, ExternalLink, ChevronRight, ShieldCheck, ShieldOff, Shield } from "lucide-react";
import type { AssetWithCounts } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({ where: { id }, select: { name: true } });
  return { title: asset ? `${asset.name} — Asset Tracker` : "Asset Tracker" };
}

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      attachments: { orderBy: { createdAt: "asc" } },
      subItems: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { subItems: true, attachments: true } } },
      },
      parent: { select: { id: true, name: true } },
    },
  });

  if (!asset) notFound();

  const profitLoss =
    asset.salePrice != null && asset.purchasePrice != null
      ? asset.salePrice - asset.purchasePrice
      : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      {asset.parent && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/assets" className="hover:text-foreground">Assets</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/assets/${asset.parent.id}`} className="hover:text-foreground">
            {asset.parent.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{asset.name}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{asset.name}</h1>
          {asset.manufacturer && (
            <p className="text-muted-foreground mt-0.5">{asset.manufacturer}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={asset.status} />
          <Link href={`/assets/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail label="Model Number" value={asset.modelNumber} />
            <Detail label="Serial Number" value={asset.serialNumber} />
            <Detail label="Quantity" value={String(asset.quantity)} />
            <Detail label="Status" value={<StatusBadge status={asset.status} />} />
            <Detail label="Purchase Date" value={formatDate(asset.purchaseDate)} />
            <Detail label="Purchase Price" value={formatCurrency(asset.purchasePrice)} />
            <Detail label="Purchase Location" value={asset.purchaseLocation} />
            {asset.url && (
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-xs">Product URL</p>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline truncate"
                >
                  {asset.url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {asset.status === "SOLD" && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Detail label="Sale Date" value={formatDate(asset.saleDate)} />
                <Detail label="Sale Price" value={formatCurrency(asset.salePrice)} />
                <Detail
                  label="Profit / Loss"
                  value={
                    profitLoss != null ? (
                      <span className={profitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(profitLoss)}
                      </span>
                    ) : null
                  }
                />
              </div>
            </>
          )}

          {asset.warrantyExpiry && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">Warranty</p>
                  <div className="font-medium"><WarrantyBadge expiry={asset.warrantyExpiry} /></div>
                </div>
                <Detail label="Expires" value={formatDate(asset.warrantyExpiry)} />
                {asset.warrantyNotes && (
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-muted-foreground text-xs">Warranty Notes</p>
                    <p className="font-medium">{asset.warrantyNotes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {asset.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardContent className="pt-6">
          <AttachmentList assetId={id} initialAttachments={asset.attachments} />
        </CardContent>
      </Card>

      {/* Sub-items */}
      <Card>
        <CardContent className="pt-6">
          <SubItemList
            parentId={id}
            subItems={asset.subItems as unknown as AssetWithCounts[]}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Added {formatDate(asset.createdAt)} · Last updated {formatDate(asset.updatedAt)}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function WarrantyBadge({ expiry }: { expiry: Date }) {
  const now = new Date();
  const expiryDate = new Date(expiry);
  const active = expiryDate > now;
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const expiringSoon = active && daysLeft <= 90;

  if (active && expiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
        <Shield className="h-3.5 w-3.5" />
        Active · expires in {daysLeft}d
      </span>
    );
  }
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <ShieldOff className="h-3.5 w-3.5" />
      Expired
    </span>
  );
}
