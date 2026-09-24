import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { getOptionalEnv, getRequiredEnv } from "./env.js";

export const SITE_ACCESS_COOKIE = "kleva_site_access";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signingSecret() {
  return getRequiredEnv("BETTER_AUTH_SECRET");
}

export function siteAccessPassword() {
  return getOptionalEnv("SITE_ACCESS_PASSWORD", "unstablegeometry");
}

function useCrossSiteCookies() {
  const baseURL = getRequiredEnv("BETTER_AUTH_URL");
  return baseURL.startsWith("https://") || getOptionalEnv("NODE_ENV") === "production";
}

function hmac(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function passwordMatches(given: string) {
  return safeEqualHex(hmac(`password:${given}`), hmac(`password:${siteAccessPassword()}`));
}

export function issueSiteAccessToken() {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${hmac(`site-access:${payload}`)}`;
}

export function siteAccessTokenIsValid(token: string) {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(payload) || !sig) return false;
  if (!safeEqualHex(sig, hmac(`site-access:${payload}`))) return false;
  return Number(payload) > Date.now();
}

export function readCookie(req: Request, name: string) {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return undefined;
}

export function hasValidSiteAccess(req: Request) {
  const token = readCookie(req, SITE_ACCESS_COOKIE);
  return Boolean(token && siteAccessTokenIsValid(token));
}

export function setSiteAccessCookie(res: Response) {
  const maxAge = Math.floor(TTL_MS / 1000);
  const parts = [
    `${SITE_ACCESS_COOKIE}=${encodeURIComponent(issueSiteAccessToken())}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
  ];
  if (useCrossSiteCookies()) {
    parts.push("Secure", "SameSite=None", "Partitioned");
  } else {
    parts.push("SameSite=Lax");
  }
  res.append("Set-Cookie", parts.join("; "));
}
