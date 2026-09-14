import { readFileSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import { brand } from "../emails/brand.js";
import { renderInviteEmail } from "../emails/index.js";
import { getOptionalEnv } from "../lib/env.js";

export const emailPreviewRouter = Router();

emailPreviewRouter.get("/emails/assets/kleva-mark.png", (_req, res) => {
  const file = path.resolve(process.cwd(), "assets/kleva-mark.png");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(readFileSync(file));
});

emailPreviewRouter.get("/emails/preview/invite", (_req, res) => {
  if (getOptionalEnv("NODE_ENV") === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const email = renderInviteEmail({
    parentName: "Ada Mensah",
    relationship: "Mother",
    actionUrl: "http://localhost:5173/invite/preview",
    expiresInDays: 14,
  });

  const html = email.html.replaceAll(
    `cid:${brand.logoCid}`,
    "/api/emails/assets/kleva-mark.png",
  );

  res.removeHeader("Content-Security-Policy");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
