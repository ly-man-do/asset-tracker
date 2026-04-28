"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSearchDialog } from "@/components/assets/SearchBar";

export function Header() {
  const { open } = useSearchDialog();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-muted-foreground w-64 justify-start"
        onClick={open}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search assets...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
