"use client";

import { useRef, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CSV_HEADERS } from "@/lib/csv";

interface ImportError {
  row: number;
  error: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

type Stage = "pick" | "preview" | "result";

export function CsvImportDialog({ open, onOpenChange, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [stage, setStage] = useState<Stage>("pick");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);

  function reset() {
    setFile(null);
    setRowCount(0);
    setStage("pick");
    setImporting(false);
    setImported(0);
    setErrors([]);
  }

  function handleClose(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  function handleFile(f: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Count non-empty data rows (skip header)
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      setRowCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(f);
    setFile(f);
    setStage("preview");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) handleFile(f);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/assets/import", { method: "POST", body: formData });
    const data = await res.json();

    setImported(data.imported ?? 0);
    setErrors(data.errors ?? []);
    setStage("result");
    setImporting(false);

    if ((data.imported ?? 0) > 0) onImported();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Assets from CSV</DialogTitle>
        </DialogHeader>

        {stage === "pick" && (
          <>
            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Drop a CSV file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {/* Expected columns */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Expected columns:</p>
              <p>{CSV_HEADERS.join(", ")}</p>
              <p className="pt-1">
                Only <span className="font-medium text-foreground">Name</span> is required.
                Use <span className="font-medium text-foreground">Export CSV</span> to get a template.
              </p>
            </div>
          </>
        )}

        {stage === "preview" && file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/40">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rowCount} asset{rowCount !== 1 ? "s" : ""} detected
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Rows missing a Name will be skipped. Existing assets are not affected.
            </p>
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/40">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <p className="text-sm font-medium">{imported} asset{imported !== 1 ? "s" : ""} imported successfully</p>
            </div>
            {errors.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.length} row{errors.length !== 1 ? "s" : ""} skipped</span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded border border-border text-xs divide-y divide-border">
                  {errors.map((e, i) => (
                    <div key={i} className="px-3 py-1.5 flex gap-3">
                      <span className="text-muted-foreground shrink-0">Row {e.row}</span>
                      <span>{e.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {stage === "pick" && (
            <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          )}
          {stage === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleImport} disabled={importing || rowCount === 0}>
                {importing ? "Importing..." : `Import ${rowCount} asset${rowCount !== 1 ? "s" : ""}`}
              </Button>
            </>
          )}
          {stage === "result" && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
