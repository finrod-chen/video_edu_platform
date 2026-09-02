import { mkdir, open, readdir, rm, writeFile } from "fs/promises";
import path from "path";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUploadId(uploadId: string): boolean {
  return UUID_RE.test(uploadId);
}

function uploadRoot(): string {
  // turbopackIgnore: UPLOAD_DIR is a runtime-only env var (a mounted Docker
  // volume, not a build-time asset) -- without this, Turbopack's output
  // file tracing conservatively bundles the entire project into the
  // standalone server output trying to statically resolve this path.
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR ?? "./uploads");
}

export function tmpChunkDir(uploadId: string): string {
  if (!isValidUploadId(uploadId)) {
    throw new Error("Invalid uploadId");
  }
  return path.join(uploadRoot(), "tmp", uploadId);
}

export function manualStepDir(manualId: number, stepId: number): string {
  return path.join(uploadRoot(), "manuals", String(manualId), "steps", String(stepId));
}

export function manualAttachmentDir(manualId: number): string {
  return path.join(uploadRoot(), "manuals", String(manualId), "attachments");
}

export async function writeChunk(uploadId: string, index: number, data: Buffer): Promise<void> {
  const dir = tmpChunkDir(uploadId);
  await mkdir(dir, { recursive: true });
  const chunkName = `chunk-${String(index).padStart(6, "0")}`;
  await writeFile(path.join(dir, chunkName), data);
}

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extensionForMime(mimeType: string, fallback = "mp4"): string {
  return EXT_BY_MIME[mimeType] ?? fallback;
}

/**
 * Concatenates all chunk files written for `uploadId` (in index order) into
 * `manuals/<manualId>/steps/<stepId>/video.<ext>`, then removes the tmp dir.
 * Returns the path relative to the upload root (what gets stored in the DB).
 */
export async function assembleUpload(
  uploadId: string,
  manualId: number,
  stepId: number,
  extension: string
): Promise<string> {
  const dir = tmpChunkDir(uploadId);
  const entries = (await readdir(dir)).filter((f) => f.startsWith("chunk-")).sort();
  if (entries.length === 0) {
    throw new Error("No chunks found for uploadId");
  }

  const destDir = manualStepDir(manualId, stepId);
  await mkdir(destDir, { recursive: true });
  const relativePath = path.join("manuals", String(manualId), "steps", String(stepId), `video.${extension}`);
  const destPath = path.join(uploadRoot(), relativePath);

  const destHandle = await open(destPath, "w");
  try {
    for (const entry of entries) {
      const chunkHandle = await open(path.join(dir, entry), "r");
      try {
        const { size } = await chunkHandle.stat();
        const buffer = Buffer.alloc(size);
        await chunkHandle.read(buffer, 0, size, 0);
        await destHandle.write(buffer);
      } finally {
        await chunkHandle.close();
      }
    }
  } finally {
    await destHandle.close();
  }

  await rm(dir, { recursive: true, force: true });
  return relativePath.split(path.sep).join("/");
}

export async function saveThumbnail(
  manualId: number,
  stepId: number,
  data: Buffer
): Promise<string> {
  const destDir = manualStepDir(manualId, stepId);
  await mkdir(destDir, { recursive: true });
  const relativePath = path.join("manuals", String(manualId), "steps", String(stepId), "thumbnail.jpg");
  await writeFile(path.join(uploadRoot(), relativePath), data);
  return relativePath.split(path.sep).join("/");
}

export async function saveStepImage(
  manualId: number,
  stepId: number,
  data: Buffer,
  extension: string
): Promise<string> {
  const destDir = manualStepDir(manualId, stepId);
  await mkdir(destDir, { recursive: true });
  const relativePath = path.join("manuals", String(manualId), "steps", String(stepId), `image.${extension}`);
  await writeFile(path.join(uploadRoot(), relativePath), data);
  return relativePath.split(path.sep).join("/");
}

export async function deleteManualStepFiles(manualId: number, stepId: number): Promise<void> {
  await rm(manualStepDir(manualId, stepId), { recursive: true, force: true });
}

export async function saveManualAttachment(
  manualId: number,
  attachmentId: number,
  data: Buffer
): Promise<string> {
  const destDir = manualAttachmentDir(manualId);
  await mkdir(destDir, { recursive: true });
  const relativePath = path.join("manuals", String(manualId), "attachments", `${attachmentId}.pdf`);
  await writeFile(path.join(uploadRoot(), relativePath), data);
  return relativePath.split(path.sep).join("/");
}

export async function deleteManualAttachmentFile(manualId: number, attachmentId: number): Promise<void> {
  await rm(path.join(manualAttachmentDir(manualId), `${attachmentId}.pdf`), { force: true });
}

export async function deleteManualFiles(manualId: number): Promise<void> {
  await rm(path.join(uploadRoot(), "manuals", String(manualId)), { recursive: true, force: true });
}

export function resolveStoredPath(relativePath: string): string {
  // Stored paths are always DB-controlled (written by assembleUpload/
  // saveThumbnail above), never taken directly from a request -- still
  // reject any that look like they'd escape the upload root.
  const root = uploadRoot();
  const resolved = path.resolve(/* turbopackIgnore: true */ root, relativePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid stored path");
  }
  return resolved;
}
