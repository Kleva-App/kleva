import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, type SessionUser } from "../lib/auth.js";
import { userHasRole } from "../lib/access.js";

export type AuthenticatedRequest = Request & {
  user?: SessionUser;
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
    next();
  } catch (err) {
    res.status(401).json({
      error: err instanceof Error ? err.message : "Unauthorized",
    });
  }
}

export async function requireParent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const ok = await userHasRole(req.user.id, "parent");
    if (!ok) {
      res.status(403).json({ error: "Parent access required" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to verify parent role",
    });
  }
}

export async function requireFinance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const parent = await userHasRole(req.user.id, "parent");
    const institution = await userHasRole(req.user.id, "institution");
    if (!parent && !institution) {
      res.status(403).json({ error: "Finance access required" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to verify finance access",
    });
  }
}
