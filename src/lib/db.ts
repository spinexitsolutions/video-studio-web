import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { createSeed } from "./seed";
import type { BaseDoc, CollectionKey, Database, SingletonKey, Singletons } from "./types";

/**
 * A tiny, dependency-free JSON document store.
 * - Data lives in data/db.json (created + seeded on first run)
 * - Reads are served from an in-memory cache that reloads when the file changes
 * - Writes are serialized and atomic (write temp file + rename)
 */

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

type Cache = { db: Database; mtime: number } | null;
const g = globalThis as unknown as { __studioDb?: Cache; __studioWrite?: Promise<void> };

function seedDatabase(): Database {
  const email = process.env.ADMIN_EMAIL || "admin@lumenstudio.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const db = createSeed(email, bcrypt.hashSync(password, 10));
  writeFileAtomic(db);
  return db;
}

function writeFileAtomic(db: Database) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

/** Fill in any keys added to the schema after the database was created. */
function migrate(db: Database): Database {
  const fresh = createSeed("", "");
  for (const key of Object.keys(fresh.singletons) as SingletonKey[]) {
    db.singletons[key] = { ...fresh.singletons[key], ...(db.singletons[key] || {}) } as any;
  }
  for (const key of Object.keys(fresh.collections) as CollectionKey[]) {
    if (!Array.isArray(db.collections[key])) db.collections[key] = [];
  }
  return db;
}

export function readDb(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const db = seedDatabase();
    g.__studioDb = { db, mtime: fs.statSync(DB_FILE).mtimeMs };
    return db;
  }
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  if (g.__studioDb && g.__studioDb.mtime === mtime) return g.__studioDb.db;
  const db = migrate(JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database);
  g.__studioDb = { db, mtime };
  return db;
}

async function mutate<T>(fn: (db: Database) => T): Promise<T> {
  const prev = g.__studioWrite || Promise.resolve();
  let result!: T;
  const next = prev.then(() => {
    const db = structuredClone(readDb());
    result = fn(db);
    writeFileAtomic(db);
    g.__studioDb = { db, mtime: fs.statSync(DB_FILE).mtimeMs };
  });
  g.__studioWrite = next.catch(() => undefined);
  await next;
  return result;
}

export const newId = () => crypto.randomBytes(9).toString("base64url");

/* ---------------------------- Singletons ---------------------------- */

export function getSingleton<K extends SingletonKey>(key: K): Singletons[K] {
  return readDb().singletons[key];
}

export function updateSingleton<K extends SingletonKey>(key: K, data: Partial<Singletons[K]>) {
  return mutate((db) => {
    db.singletons[key] = { ...db.singletons[key], ...data };
    return db.singletons[key];
  });
}

/* ---------------------------- Collections --------------------------- */

export function listDocs<T extends BaseDoc = BaseDoc>(
  key: CollectionKey,
  opts: { published?: boolean; sort?: "order" | "newest" } = {}
): T[] {
  let docs = [...(readDb().collections[key] || [])] as T[];
  if (opts.published) docs = docs.filter((d) => d.published !== false);
  if (opts.sort === "newest") docs.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  else docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return docs;
}

export function getDoc<T extends BaseDoc = BaseDoc>(key: CollectionKey, id: string): T | undefined {
  return readDb().collections[key]?.find((d) => d.id === id) as T | undefined;
}

export function findDoc<T extends BaseDoc = BaseDoc>(key: CollectionKey, field: string, value: unknown): T | undefined {
  return readDb().collections[key]?.find((d) => d[field] === value) as T | undefined;
}

export function createDoc<T extends BaseDoc = BaseDoc>(key: CollectionKey, data: Record<string, any>): Promise<T> {
  return mutate((db) => {
    const list = db.collections[key];
    const ts = new Date().toISOString();
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data;
    const doc = {
      ...rest,
      id: newId(),
      order: typeof rest.order === "number" ? rest.order : list.reduce((m, d) => Math.max(m, d.order ?? 0), 0) + 1,
      createdAt: ts,
      updatedAt: ts,
    } as T;
    list.push(doc);
    return doc;
  });
}

export function updateDoc<T extends BaseDoc = BaseDoc>(key: CollectionKey, id: string, data: Record<string, any>): Promise<T | undefined> {
  return mutate((db) => {
    const list = db.collections[key];
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    const { id: _id, createdAt: _c, ...rest } = data;
    list[idx] = { ...list[idx], ...rest, updatedAt: new Date().toISOString() };
    return list[idx] as T;
  });
}

export function deleteDoc(key: CollectionKey, id: string): Promise<boolean> {
  return mutate((db) => {
    const before = db.collections[key].length;
    db.collections[key] = db.collections[key].filter((d) => d.id !== id);
    return db.collections[key].length !== before;
  });
}

export function reorderDocs(key: CollectionKey, ids: string[]): Promise<void> {
  return mutate((db) => {
    const pos = new Map(ids.map((id, i) => [id, i + 1]));
    for (const d of db.collections[key]) {
      if (pos.has(d.id)) d.order = pos.get(d.id)!;
    }
  });
}

export function resetDatabase() {
  if (fs.existsSync(DB_FILE)) fs.rmSync(DB_FILE);
  g.__studioDb = null;
  return readDb();
}

/** Run an arbitrary transactional change against the whole database. */
export const transact = mutate;
