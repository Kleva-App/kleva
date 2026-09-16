import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import {
  requireAuth,
  requireSchoolAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { assignAccountRole } from "../lib/access.js";
import {
  shortNameFromName,
  slugifySchoolId,
  type School,
} from "../lib/schools.js";

export const schoolAdminRouter = Router();

schoolAdminRouter.use("/school-admin", requireAuth, requireSchoolAdmin);

function toSchool(row: { id: string; name: string; short_name: string }): School {
  return { id: row.id, name: row.name, shortName: row.short_name };
}

async function assertAdministersSchool(userId: string, schoolId: string) {
  const row = await db("school_admins")
    .where({ user_id: userId, school_id: schoolId })
    .first("id");
  if (!row) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

schoolAdminRouter.get(
  "/school-admin/schools",
  async (req: AuthenticatedRequest, res) => {
    try {
      const rows = await db("school_admins as sa")
        .join("schools as s", "s.id", "sa.school_id")
        .where("sa.user_id", req.user!.id)
        .select("s.id", "s.name", "s.short_name")
        .orderBy("s.name");

      res.json(rows.map(toSchool));
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to load schools",
      });
    }
  },
);

const createSchoolSchema = z.object({
  name: z.string().trim().min(2).max(120),
  shortName: z.string().trim().min(1).max(8).optional(),
});

schoolAdminRouter.post(
  "/school-admin/schools",
  async (req: AuthenticatedRequest, res) => {
    try {
      const body = createSchoolSchema.parse(req.body);
      const shortName = body.shortName?.toUpperCase() || shortNameFromName(body.name);

      let id = slugifySchoolId(body.name);
      const existing = await db("schools").where({ id }).first("id");
      if (existing) {
        id = `${id}-${randomUUID().slice(0, 8)}`;
      }

      await db("schools").insert({
        id,
        name: body.name,
        short_name: shortName,
      });

      await db("school_admins").insert({
        user_id: req.user!.id,
        school_id: id,
      });

      res.status(201).json({ id, name: body.name, shortName });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.flatten() });
        return;
      }
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to create school",
      });
    }
  },
);

const patchSchoolSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  shortName: z.string().trim().min(1).max(8).optional(),
});

schoolAdminRouter.patch(
  "/school-admin/schools/:id",
  async (req: AuthenticatedRequest, res) => {
    try {
      const schoolId = req.params.id!;
      await assertAdministersSchool(req.user!.id, schoolId);
      const body = patchSchoolSchema.parse(req.body);

      const updates: { name?: string; short_name?: string } = {};
      if (body.name) updates.name = body.name;
      if (body.shortName) updates.short_name = body.shortName.toUpperCase();

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "Nothing to update" });
        return;
      }

      await db("schools").where({ id: schoolId }).update(updates);
      const row = await db("schools").where({ id: schoolId }).first("id", "name", "short_name");
      if (!row) {
        res.status(404).json({ error: "School not found" });
        return;
      }
      res.json(toSchool(row));
    } catch (err) {
      if ((err as Error & { status?: number }).status === 403) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.flatten() });
        return;
      }
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to update school",
      });
    }
  },
);

schoolAdminRouter.get(
  "/school-admin/admins",
  async (req: AuthenticatedRequest, res) => {
    try {
      const schoolId = typeof req.query.schoolId === "string" ? req.query.schoolId : "";
      if (!schoolId) {
        res.status(400).json({ error: "schoolId is required" });
        return;
      }
      await assertAdministersSchool(req.user!.id, schoolId);

      const rows = await db("school_admins as sa")
        .join("user as u", "u.id", "sa.user_id")
        .where("sa.school_id", schoolId)
        .select("u.id", "u.name", "u.email", "sa.created_at")
        .orderBy("u.name");

      res.json(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          createdAt: row.created_at,
        })),
      );
    } catch (err) {
      if ((err as Error & { status?: number }).status === 403) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to load admins",
      });
    }
  },
);

const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  schoolId: z.string().min(1),
});

schoolAdminRouter.post(
  "/school-admin/admins",
  async (req: AuthenticatedRequest, res) => {
    try {
      const body = createAdminSchema.parse(req.body);
      await assertAdministersSchool(req.user!.id, body.schoolId);

      const email = body.email.toLowerCase();
      const existing = await db("user").where({ email }).first("id");
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const userId = randomUUID();
      const accountId = randomUUID();
      const passwordHash = await hashPassword(body.password);
      const now = new Date();

      await db.transaction(async (trx) => {
        await trx("user").insert({
          id: userId,
          name: body.name,
          email,
          email_verified: false,
          created_at: now,
          updated_at: now,
        });

        await trx("account").insert({
          id: accountId,
          user_id: userId,
          account_id: userId,
          provider_id: "credential",
          password: passwordHash,
          created_at: now,
          updated_at: now,
        });
      });

      await assignAccountRole(userId, "school_admin");
      await db("school_admins").insert({
        user_id: userId,
        school_id: body.schoolId,
      });

      res.status(201).json({
        id: userId,
        name: body.name,
        email,
        createdAt: now.toISOString(),
      });
    } catch (err) {
      if ((err as Error & { status?: number }).status === 403) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.flatten() });
        return;
      }
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to create admin",
      });
    }
  },
);
