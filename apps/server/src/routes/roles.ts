import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { assignAccountRole } from "../lib/access.js";

export const rolesRouter = Router();

const assignRoleSchema = z.object({
  role: z.enum(["student", "teacher", "parent", "institution"]),
});

rolesRouter.post("/roles", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const body = assignRoleSchema.parse(req.body);
    const userId = req.user!.id;
    const existing = await db("user_roles")
      .where({ user_id: userId, role: body.role })
      .first();

    await assignAccountRole(userId, body.role);

    const row = await db("user_roles")
      .where({ user_id: userId, role: body.role })
      .first();

    res.status(existing ? 200 : 201).json(row);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to assign role",
    });
  }
});
