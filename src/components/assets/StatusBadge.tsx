import { Badge } from "@/components/ui/badge";
import type { AssetStatus } from "@/types";

interface StatusBadgeProps {
  status: AssetStatus;
}

const config: Record<AssetStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  SOLD: {
    label: "Sold",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  LOST: {
    label: "Lost",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
