import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

// Local-disk storage for the MVP. Callers only ever deal in opaque storage
// "keys" (e.g. "briefs/<briefId>/v1-name.png"), never filesystem paths, so
// swapping this module for an S3-compatible backend later (putObject/
// getObject or presigned URLs) doesn't require touching any calling code.
const STORAGE_ROOT = process.env.STORAGE_LOCAL_PATH ?? "./uploads";

// The storage root comes from an env var (so it's swappable per-environment),
// which Turbopack can't statically analyze and would otherwise respond to by
// tracing and bundling the entire project as a deploy dependency. It's not
// user input, so the ignore directives below are safe.
function resolveKeyPath(key: string): string {
  const full = path.resolve(/* turbopackIgnore: true */ STORAGE_ROOT, key);
  const root = path.resolve(/* turbopackIgnore: true */ STORAGE_ROOT);
  if (!full.startsWith(root + path.sep) && full !== root) {
    throw new Error("Invalid storage key");
  }
  return full;
}

export async function saveFile(key: string, data: Buffer): Promise<string> {
  const fullPath = resolveKeyPath(key);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, data);
  return key;
}

export async function readStoredFile(key: string): Promise<Buffer> {
  return readFile(/* turbopackIgnore: true */ resolveKeyPath(key));
}
