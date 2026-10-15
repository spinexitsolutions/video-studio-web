import { createDoc, listDocs } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import { ALLOWED_MIME, storeUpload } from "@/lib/images";

export const runtime = "nodejs";
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
  for (const f of files) {
    if (!ALLOWED_MIME.includes(f.type)) return bad(`Unsupported file type: ${f.type || "unknown"}`);
    if (f.size > MAX) return bad(`${f.name} is larger than 50 MB`);
  }
  const created = [];
  try {
    for (const file of files) {
      const stored = await storeUpload(Buffer.from(await file.arrayBuffer()), file.type, file.name);
      created.push(
        await createDoc("media", {
          ...stored,
          originalName: file.name,
          mime: stored.url.endsWith(".webp") && file.type !== "image/webp" ? "image/webp" : file.type,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        })
      );
    }
  } catch (e: any) {
    return bad(e.message || "Upload failed", 500);
  }
  return json(created, 201);
}
