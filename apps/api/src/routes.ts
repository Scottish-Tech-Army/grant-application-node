import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { loadDb, saveDb, latestCommonFieldVersion } from "./db.js";
import { now, sortByVersionDesc } from "./util.js";
import type {
  Application,
  ApplicationSpecificField,
  ApplicationSpecificFieldVersion,
  DbModel,
  FieldType
} from "./types.js";

const FieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  group: z.string().min(1).default("General"),
  type: z.enum(["text", "textarea", "number", "url"]).default("textarea"),
  helpText: z.string().optional().default("")
});

const NewVersionSchema = z.object({ value: z.string().optional().default("") });

const NewAppSchema = z.object({
  name: z.string().min(1),
  funder: z.string().optional().default("")
});

const SelectedCommonSchema = z.object({
  selectedCommon: z.array(z.object({ fieldId: z.string().min(1), versionId: z.string().min(1) }))
});

const NewSpecificFieldSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "number", "url"]).default("textarea")
});

export function registerRoutes(app: Express): void {
  app.get("/api/health", (_: Request, res: Response) => res.json({ ok: true }));

  // Common fields
  app.get("/api/common-fields", (_: Request, res: Response) => {
    const db = loadDb();
    const out = db.commonFields.map(f => ({ ...f, latestVersion: latestCommonFieldVersion(db, f.id) }));
    res.json(out);
  });

  app.post("/api/common-fields", (req: Request, res: Response) => {
    const parsed = FieldSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const field = { id: nanoid(), createdAt: now(), ...parsed.data };
    db.commonFields.push(field);

    const v1 = { id: nanoid(), fieldId: field.id, version: 1, value: "", createdAt: now() };
    db.fieldVersions.push(v1);

    saveDb(db);
    return res.status(201).json({ field, v1 });
  });

  app.get("/api/common-fields/:id/versions", (req: Request, res: Response) => {
    const db = loadDb();
    const versions = sortByVersionDesc(db.fieldVersions.filter(v => v.fieldId === req.params.id));
    res.json(versions);
  });

  app.post("/api/common-fields/:id/versions", (req: Request, res: Response) => {
    const parsed = NewVersionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const field = db.commonFields.find(f => f.id === req.params.id);
    if (!field) return res.status(404).json({ error: "Field not found" });

    const latest = latestCommonFieldVersion(db, field.id);
    const newV = {
      id: nanoid(),
      fieldId: field.id,
      version: (latest?.version || 0) + 1,
      value: parsed.data.value ?? "",
      createdAt: now()
    };

    db.fieldVersions.push(newV);
    saveDb(db);
    return res.status(201).json(newV);
  });

  // Applications
  app.get("/api/applications", (_: Request, res: Response) => {
    const db = loadDb();
    res.json(db.applications);
  });

  app.post("/api/applications", (req: Request, res: Response) => {
    const parsed = NewAppSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const a: Application = {
      id: nanoid(),
      createdAt: now(),
      status: "draft",
      name: parsed.data.name,
      funder: parsed.data.funder,
      selectedCommon: [],
      specificFields: []
    };

    db.applications.push(a);
    saveDb(db);
    return res.status(201).json(a);
  });

  app.get("/api/applications/:id", (req: Request, res: Response) => {
    const db = loadDb();
    const a = db.applications.find(x => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });
    res.json(a);
  });

  app.put("/api/applications/:id/selected-common", (req: Request, res: Response) => {
    const parsed = SelectedCommonSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const a = db.applications.find(x => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });

    for (const item of parsed.data.selectedCommon) {
      const ok = db.fieldVersions.some(v => v.id === item.versionId && v.fieldId === item.fieldId);
      if (!ok) return res.status(400).json({ error: `Invalid mapping for fieldId=${item.fieldId}` });
    }

    a.selectedCommon = parsed.data.selectedCommon;
    saveDb(db);
    res.json(a);
  });

  app.post("/api/applications/:id/specific-fields", (req: Request, res: Response) => {
    const parsed = NewSpecificFieldSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const a = db.applications.find(x => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });

    const sf: ApplicationSpecificField = {
      id: nanoid(),
      label: parsed.data.label,
      type: parsed.data.type as FieldType,
      versions: [{ id: nanoid(), version: 1, value: "", createdAt: now() }]
    };

    a.specificFields.push(sf);
    saveDb(db);
    res.status(201).json(sf);
  });

  app.post("/api/applications/:id/specific-fields/:sfid/versions", (req: Request, res: Response) => {
    const parsed = NewVersionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const db = loadDb();
    const a = db.applications.find(x => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });

    const sf = a.specificFields.find(s => s.id === req.params.sfid);
    if (!sf) return res.status(404).json({ error: "Specific field not found" });

    const latest = sortByVersionDesc(sf.versions)[0];
    const newV: ApplicationSpecificFieldVersion = {
      id: nanoid(),
      version: (latest?.version || 0) + 1,
      value: parsed.data.value ?? "",
      createdAt: now()
    };

    sf.versions.push(newV);
    saveDb(db);
    res.status(201).json(newV);
  });

  // Export
  app.get("/api/applications/:id/export", (req: Request, res: Response) => {
    const format = String(req.query.format || "plain");
    const db = loadDb();
    const a = db.applications.find(x => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });

    const header = `${a.name}${a.funder ? " — " + a.funder : ""}`;
    const lines: string[] = [];

    if (format === "markdown") lines.push(`# ${header}\n`);
    else lines.push(header, "-".repeat(header.length), "");

    const section = (t: string) => {
      if (format === "markdown") lines.push(`## ${t}\n`);
      else lines.push(`${t.toUpperCase()}\n`);
    };

    section("Common information");
    for (const sel of a.selectedCommon) {
      const f = db.commonFields.find(x => x.id === sel.fieldId);
      const v = db.fieldVersions.find(x => x.id === sel.versionId);
      if (!f || !v) continue;

      if (format === "markdown") lines.push(`**${f.label}** (v${v.version})\n\n${v.value || ""}\n`);
      else lines.push(`${f.label} (v${v.version})\n${v.value || ""}\n`);
    }

    section("Application-specific information");
    for (const sf of a.specificFields) {
      const latest = sortByVersionDesc(sf.versions)[0];
      if (format === "markdown") lines.push(`**${sf.label}** (v${latest?.version || 0})\n\n${latest?.value || ""}\n`);
      else lines.push(`${sf.label} (v${latest?.version || 0})\n${latest?.value || ""}\n`);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(lines.join("\n"));
  });

  // Backup/Restore
  app.get("/api/backup", (_: Request, res: Response) => {
    res.json(loadDb());
  });

  app.post("/api/restore", (req: Request, res: Response) => {
    const body = req.body as Partial<DbModel>;
    if (!body || !body.commonFields || !body.fieldVersions || !body.applications) {
      return res.status(400).json({ error: "Invalid backup format" });
    }
    saveDb(body as DbModel);
    res.json({ ok: true });
  });
}
