import { z } from "zod";
import { listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { grantGallery } from "@/lib/gallery-auth";
import { verifyCaptcha } from "@/lib/captcha";
import { galleryExpired } from "@/lib/gallery";
import { clientIp } from "@/lib/url";
import type { Gallery } from "@/lib/types";

const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = clientIp(req);
  const a = attempts.get(ip);
  if (a && a.n >= 10 && a.until > Date.now()) return bad("Too many attempts — please wait a few minutes.", 429);
  const parsed = z.object({ code: z.string().trim().min(1).max(64), slug: z.string().optional(), captcha: z.string().optional() }).safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad("Please enter your gallery code");
  if (!(await verifyCaptcha(parsed.data.captcha, ip))) return bad("Captcha check failed — please try again.");
  const code = parsed.data.code.toLowerCase();
  const g = listDocs<Gallery>("galleries", { published: true }).find(
    (x) => x.accessCode && x.accessCode.toLowerCase() === code && (!parsed.data.slug || x.slug === parsed.data.slug)
  );
  if (!g) {
    attempts.set(ip, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    return bad("That code doesn't match any gallery.", 401);
  }
  if (galleryExpired(g)) return bad("This gallery has expired. Please contact the studio.", 410);
  attempts.delete(ip);
  await grantGallery(g.id);
  return json({ ok: true, slug: g.slug });
}
