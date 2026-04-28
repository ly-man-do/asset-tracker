"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/assets/StatusBadge";
import type { AssetWithCounts } from "@/types";

// Shared state for opening the dialog from outside
const listeners: Array<() => void> = [];

export function useSearchDialog() {
  return {
    open: () => listeners.forEach((fn) => fn()),
  };
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssetWithCounts[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const openFn = () => setOpen(true);
    listeners.push(openFn);
    return () => {
      const i = listeners.indexOf(openFn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/assets?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setResults(data.assets ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  function handleSelect(id: string) {
    setOpen(false);
    router.push(`/assets/${id}`);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal aria-label="Search assets">
      {/* Full-screen backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div className="fixed left-1/2 top-1/3 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            ref={inputRef}
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base"
            placeholder="Search assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setOpen(false)}
            className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <p className="py-6 text-center text-sm text-muted-foreground">Searching...</p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No assets found.</p>
          )}
          {!loading && results.map((asset) => (
            <button
              key={asset.id}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
              onClick={() => handleSelect(asset.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                {asset.manufacturer && (
                  <p className="text-xs text-muted-foreground truncate">{asset.manufacturer}</p>
                )}
              </div>
              <StatusBadge status={asset.status} />
            </button>
          ))}
          {!query && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Type to search assets...
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
