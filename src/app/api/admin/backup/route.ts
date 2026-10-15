import { readDb, transact } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json, refreshSite } from "@/lib/api";

/** Download a full JSON backup of all content (password hashes excluded). */
export async function GET() {
  const [, err] = await requireUser("admin");
  if (err) return err;
  const db = structuredClone(readDb());
  db.collections.users = db.collections.users.map(({ passwordHash: _p, ...u }) => u as any);
  return new Response(JSON.stringify(db, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="studio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** Restore content from a backup. Users are kept as they are. */
export async function POST(req: Request) {
  const [, err] = await requireUser("admin");
  if (err) return err;
  const body = await req.json().catch(() => null);
  if (!body?.singletons || !body?.collections) return bad("This doesn't look like a studio backup file");
  await transact((db) => {
    db.singletons = { ...db.singletons, ...body.singletons };
    for (const [key, docs] of Object.entries(body.collections)) {
      if (key !== "users" && key in db.collections && Array.isArray(docs)) (db.collections as any)[key] = docs;
    }
  });
  refreshSite();
  return json({ ok: true });
}
