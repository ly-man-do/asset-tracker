import type { Asset, Attachment, AssetStatus } from "@/generated/prisma/client";

export type { AssetStatus };

export type AssetWithCounts = Asset & {
  _count: {
    subItems: number;
    attachments: number;
  };
};

export type AssetWithRelations = Asset & {
  subItems: Asset[];
  attachments: Attachment[];
  parent: Asset | null;
};

export type AttachmentRecord = Attachment;
