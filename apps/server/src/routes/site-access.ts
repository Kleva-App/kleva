import { Router } from "express";
import { z } from "zod";
import {
  hasValidSiteAccess,
  passwordMatches,
  setSiteAccessCookie,
} from "../lib/site-access.js";

export const siteAccessRouter = Router();

const unlockSchema = z.object({
  password: z.string().min(1).max(200),
});

siteAccessRouter.get("/site-access", (req, res) => {
  if (!hasValidSiteAccess(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  res.json({ ok: true });
});

siteAccessRouter.post("/site-access", (req, res) => {
  const parsed = unlockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password required" });
    return;
  }
  if (!passwordMatches(parsed.data.password)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  setSiteAccessCookie(res);
  res.json({ ok: true });
});
