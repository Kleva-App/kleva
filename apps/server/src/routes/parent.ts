import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireParent, type AuthenticatedRequest } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { getParentChildren } from "../lib/access.js";
import { getRequiredEnv } from "../lib/env.js";
import { sendInviteEmail } from "../emails/index.js";

export const parentRouter = Router();

const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Sponsor", "Other"] as const;
const INVITE_DAYS = 14;
const studentAppOrigin = getRequiredEnv("STUDENT_ORIGIN");

parentRouter.use("/parent", requireAuth, requireParent);

parentRouter.get("/parent/children", async (req: AuthenticatedRequest, res) => {
  try {
    const children = await getParentChildren(req.user!.id);
    res.json(children);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load children",
    });
  }
});

parentRouter.delete("/parent/children/:linkId", async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db("parent_students")
      .where({ id: req.params.linkId, parent_id: req.user!.id })
      .delete();

    if (!deleted) {
      res.status(404).json({ error: "Linked student not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to remove student",
    });
  }
});

const inviteSchema = z.object({
  email: z.string().trim().email(),
  relationship: z.enum(RELATIONSHIPS).default("Guardian"),
});

parentRouter.get("/parent/invitations", async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await db("parent_invitations")
      .where({ parent_id: req.user!.id })
      .whereIn("status", ["pending"])
      .orderBy("created_at", "desc");

    res.json(rows.map((row) => serializeInvite(row, req.user!.name)));
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load invitations",
    });
  }
});

parentRouter.post("/parent/invitations", async (req: AuthenticatedRequest, res) => {
  try {
    const body = inviteSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const parentId = req.user!.id;

    if (email === req.user!.email.toLowerCase()) {
      res.status(400).json({ error: "You cannot invite your own account" });
      return;
    }

    const existingUser = await db("user")
      .whereRaw("lower(email) = ?", [email])
      .first("id", "email");

    if (existingUser) {
      const studentRole = await db("user_roles")
        .where({ user_id: existingUser.id, role: "student" })
        .first();
      if (!studentRole) {
        res.status(400).json({ error: "That email is not a student account" });
        return;
      }

      const linked = await db("parent_students")
        .where({ parent_id: parentId, student_id: existingUser.id })
        .first();
      if (linked) {
        res.status(400).json({ error: "That student is already linked to your account" });
        return;
      }
    }

    const pending = await db("parent_invitations")
      .where({
        parent_id: parentId,
        student_email: email,
        status: "pending",
      })
      .first();

    const token = pending?.token ?? randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);

    let row = pending;
    if (pending) {
      const [updated] = await db("parent_invitations")
        .where({ id: pending.id })
        .update({
          relationship: body.relationship,
          student_id: existingUser?.id ?? pending.student_id,
          expires_at: expiresAt,
        })
        .returning("*");
      row = updated;
    } else {
      const [created] = await db("parent_invitations")
        .insert({
          parent_id: parentId,
          student_email: email,
          student_id: existingUser?.id ?? null,
          relationship: body.relationship,
          token,
          status: "pending",
          expires_at: expiresAt,
        })
        .returning("*");
      row = created;
    }

    const mail = await sendInviteMail({
      to: email,
      parentName: req.user!.name,
      relationship: body.relationship,
      token: row.token,
    });

    res.status(pending ? 200 : 201).json({
      ...serializeInvite(row, req.user!.name),
      emailSent: mail.delivered,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to send invitation",
    });
  }
});

parentRouter.post("/parent/invitations/:id/resend", async (req: AuthenticatedRequest, res) => {
  try {
    const row = await db("parent_invitations")
      .where({ id: req.params.id, parent_id: req.user!.id, status: "pending" })
      .first();

    if (!row) {
      res.status(404).json({ error: "Invitation not found" });
      return;
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      res.status(410).json({ error: "This invitation has expired. Send a new one." });
      return;
    }

    const mail = await sendInviteMail({
      to: row.student_email,
      parentName: req.user!.name,
      relationship: row.relationship,
      token: row.token,
    });

    res.json({
      ...serializeInvite(row, req.user!.name),
      emailSent: mail.delivered,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to resend invitation",
    });
  }
});

parentRouter.delete("/parent/invitations/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db("parent_invitations")
      .where({ id: req.params.id, parent_id: req.user!.id, status: "pending" })
      .update({
        status: "cancelled",
        responded_at: db.fn.now(),
      });

    if (!updated) {
      res.status(404).json({ error: "Invitation not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to cancel invitation",
    });
  }
});

const profileSchema = z.object({
  phone: z.string().trim().max(40).optional(),
  nationalId: z.string().trim().max(80).optional(),
});

parentRouter.patch("/parent/profile", async (req: AuthenticatedRequest, res) => {
  try {
    const body = profileSchema.parse(req.body);
    const userId = req.user!.id;

    const existing = await db("parent_profiles").where({ user_id: userId }).first();
    const patch: Record<string, unknown> = { updated_at: db.fn.now() };
    if (body.phone !== undefined) patch.phone = body.phone || null;
    if (body.nationalId !== undefined) patch.national_id = body.nationalId || null;

    if (existing) {
      await db("parent_profiles").where({ user_id: userId }).update(patch);
    } else {
      await db("parent_profiles").insert({
        user_id: userId,
        phone: body.phone ?? null,
        national_id: body.nationalId ?? null,
      });
    }

    const row = await db("parent_profiles").where({ user_id: userId }).first();
    res.json({
      phone: row?.phone ?? null,
      nationalId: row?.national_id ?? null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to update parent profile",
    });
  }
});

function inviteUrl(token: string) {
  return `${studentAppOrigin}/invite/${token}`;
}

function serializeInvite(
  row: {
    id: string;
    student_email: string;
    relationship: string;
    status: string;
    token: string;
    expires_at: Date | string;
    created_at: Date | string;
  },
  parentName: string,
) {
  return {
    id: row.id,
    studentEmail: row.student_email,
    relationship: row.relationship,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    inviteUrl: row.status === "pending" ? inviteUrl(row.token) : undefined,
    parentName,
  };
}

function sendInviteMail({
  to,
  parentName,
  relationship,
  token,
}: {
  to: string;
  parentName: string;
  relationship: string;
  token: string;
}) {
  return sendInviteEmail(to, {
    parentName,
    relationship,
    actionUrl: inviteUrl(token),
    expiresInDays: INVITE_DAYS,
  });
}
