import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function saveUpload(file: File): Promise<{
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 50 MB limit");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));

  return {
    filename,
    originalName: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function deleteUpload(filename: string): Promise<void> {
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // File may already be gone
  }
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}
