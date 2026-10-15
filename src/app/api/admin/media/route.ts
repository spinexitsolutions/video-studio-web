import fs from "node:fs/promises";
import path from "node:path";
import { createDoc, listDocs, newId, UPLOAD_DIR } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
const MAX = 50 * 1024 * 1024;

export async function GET() {
  const [, err] = await requireUser();
  if (err) return err;
  return json(listDocs("media", { sort: "newest" }));
}

export async function POST(req: Request) {
  const [, err] = await requireUser();
  if (err) return err;
  const form = await req.formData().catch(() => null);
  if (!form) return bad("Expected multipart form data");
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return bad("No file uploaded");

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const created = [];
  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) return bad(`Unsupported file type: ${file.type || "unknown"}`);
    if (file.size > MAX) return bad(`${file.name} is larger than 50 MB`);
    const filename = `${newId()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
    created.push(
      await createDoc("media", {
        filename,
        originalName: file.name,
        url: `/media/${filename}`,
        size: file.size,
        mime: file.type,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      })
    );
  }
  return json(created, 201);
}
