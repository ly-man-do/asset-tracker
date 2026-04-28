"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  loading: boolean;
}

export function BulkActionBar({ count, onDelete, onClear, loading }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary text-primary-foreground rounded-md">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={onDelete}
          disabled={loading}
          className="h-7 text-destructive bg-background/10 hover:bg-background/20 border-0"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {loading ? "Deleting..." : "Delete"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary-foreground hover:bg-background/10"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
