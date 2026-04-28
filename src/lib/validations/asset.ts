import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  purchaseLocation: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  url: z.string().optional().transform((v) => v || undefined),
  status: z.enum(["ACTIVE", "SOLD", "LOST"]).default("ACTIVE"),
  salePrice: z.coerce.number().min(0).optional(),
  saleDate: z.string().optional(),
  notes: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  warrantyNotes: z.string().optional(),
  parentId: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
