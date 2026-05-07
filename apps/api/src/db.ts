import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { now, sortByVersionDesc } from "./util.js";
import { buildTagSeed } from "./seed.tag.js";
import type { DbModel, FieldVersion } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultDb(): DbModel {
  const seed = buildTagSeed();
  return {
    meta: { id: nanoid(), createdAt: now() },
    commonFields: seed.commonFields,
    fieldVersions: seed.fieldVersions,
    applications: []
  };
}

export function loadDb(): DbModel {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const db = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DbModel;
}

export function saveDb(db: DbModel): void {
  ensureDir();
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmp, DB_FILE);
}

export function latestCommonFieldVersion(db: DbModel, fieldId: string): FieldVersion | null {
  const versions = db.fieldVersions.filter(v => v.fieldId === fieldId);
  return sortByVersionDesc(versions)[0] ?? null;
}
