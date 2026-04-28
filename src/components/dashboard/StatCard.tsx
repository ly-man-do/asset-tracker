import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "positive" | "negative" | "warning";
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, variant = "default", subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={cn("h-4 w-4", {
            "text-muted-foreground": variant === "default",
            "text-green-500": variant === "positive",
            "text-red-500": variant === "negative",
            "text-amber-500": variant === "warning",
          })}
        />
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-2xl font-bold", {
            "text-foreground": variant === "default",
            "text-green-600 dark:text-green-400": variant === "positive",
            "text-red-600 dark:text-red-400": variant === "negative",
            "text-amber-600 dark:text-amber-400": variant === "warning",
          })}
        >
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
