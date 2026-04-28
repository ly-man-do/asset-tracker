"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Download,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { BulkActionBar } from "@/components/assets/BulkActionBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AssetWithCounts } from "@/types";

type SortField = "name" | "manufacturer" | "purchasePrice" | "purchaseDate" | "createdAt" | "status" | "quantity";

export function AssetTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = (searchParams.get("sort") ?? "createdAt") as SortField;
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const page = parseInt(searchParams.get("page") ?? "1");

  const [assets, setAssets] = useState<AssetWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set<string>());
  const [deleteTarget, setDeleteTarget] = useState<AssetWithCounts | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const limit = 50;

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", String(page));
    params.set("limit", String(limit));

    const res = await fetch(`/api/assets?${params}`);
    const data = await res.json();
    setAssets(data.assets ?? []);
    setTotal(data.total ?? 0);
    setSelected(new Set());
    setLoading(false);
  }, [q, status, sort, order, page]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
        if (k !== "page") params.set("page", "1");
      }
    }
    router.push(`${pathname}?${params}`);
  }

  function toggleSort(field: SortField) {
    if (sort === field) {
      updateParams({ sort: field, order: order === "asc" ? "desc" : "asc" });
    } else {
      updateParams({ sort: field, order: "desc" });
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
    return order === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 ml-1" />
      : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(assets.map((a) => a.id)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteSingle(asset: AssetWithCounts) {
    const res = await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${asset.name} deleted`);
      setDeleteTarget(null);
      fetchAssets();
    } else {
      toast.error("Failed to delete asset");
    }
  }

  async function bulkDelete() {
    setBulkDeleting(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => fetch(`/api/assets/${id}`, { method: "DELETE" })));
    toast.success(`${ids.length} asset${ids.length > 1 ? "s" : ""} deleted`);
    setBulkDeleting(false);
    fetchAssets();
  }

  const totalPages = Math.ceil(total / limit);
  const allSelected = assets.length > 0 && assets.every((a) => selected.has(a.id));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search assets..."
          value={q}
          onChange={(e) => updateParams({ q: e.target.value })}
          className="w-64"
        />
        <Select
          value={status || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? null : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <a href="/api/assets/export">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </a>
          <Link href="/assets/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      <BulkActionBar
        count={selected.size}
        onDelete={bulkDelete}
        onClear={() => setSelected(new Set())}
        loading={bulkDeleting}
      />

      {/* Table */}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="rounded border-border"
                />
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("manufacturer")}
                >
                  Manufacturer <SortIcon field="manufacturer" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("purchasePrice")}
                >
                  Price <SortIcon field="purchasePrice" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("quantity")}
                >
                  Qty <SortIcon field="quantity" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium"
                  onClick={() => toggleSort("purchaseDate")}
                >
                  Purchased <SortIcon field="purchaseDate" />
                </button>
              </TableHead>
              <TableHead className="text-center">Sub</TableHead>
              <TableHead className="text-center">Files</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  No assets found.{" "}
                  <Link href="/assets/new" className="text-primary hover:underline">
                    Add your first asset
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className={selected.has(asset.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(asset.id)}
                      onChange={() => toggleOne(asset.id)}
                      className="rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {asset.name}
                      {asset.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.manufacturer ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(asset.purchasePrice)}</TableCell>
                  <TableCell>{asset.quantity}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(asset.purchaseDate)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {asset._count.subItems > 0 ? (
                      <span className="font-medium text-foreground">{asset._count.subItems}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {asset._count.attachments > 0 ? (
                      <span className="font-medium text-foreground">{asset._count.attachments}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/assets/${asset.id}`}>
                            <ChevronRight className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/assets/${asset.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(asset)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total assets</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This will
            also delete all attachments and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteSingle(deleteTarget)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
