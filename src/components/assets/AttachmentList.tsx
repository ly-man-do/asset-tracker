"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Paperclip, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import type { AttachmentRecord } from "@/types";

interface AttachmentListProps {
  assetId: string;
  initialAttachments: AttachmentRecord[];
}

export function AttachmentList({ assetId, initialAttachments }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<AttachmentRecord[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/assets/${assetId}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const attachment = await res.json() as AttachmentRecord;
        setAttachments((prev) => [...prev, attachment]);
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/assets/${assetId}/attachments/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Attachment deleted");
    } else {
      toast.error("Failed to delete attachment");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          Attachments <span className="text-muted-foreground">({attachments.length})</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          No attachments yet
        </p>
      ) : (
        <div className="space-y-1">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{attachment.originalName}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatBytes(attachment.size)}
              </span>
              <a
                href={`/api/uploads/${attachment.filename}`}
                download={attachment.originalName}
                className="shrink-0"
              >
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete(attachment.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
