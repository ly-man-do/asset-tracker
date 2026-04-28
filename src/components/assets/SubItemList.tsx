import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { AssetWithCounts } from "@/types";

interface SubItemListProps {
  parentId: string;
  subItems: AssetWithCounts[];
}

export function SubItemList({ parentId, subItems }: SubItemListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          Sub-items <span className="text-muted-foreground">({subItems.length})</span>
        </h3>
        <Link href={`/assets/new?parentId=${parentId}`}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Sub-item
          </Button>
        </Link>
      </div>

      {subItems.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          No sub-items yet
        </p>
      ) : (
        <div className="space-y-1">
          {subItems.map((item) => (
            <Link
              key={item.id}
              href={`/assets/${item.id}`}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.manufacturer && (
                  <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm">{formatCurrency(item.purchasePrice)}</span>
                <StatusBadge status={item.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
