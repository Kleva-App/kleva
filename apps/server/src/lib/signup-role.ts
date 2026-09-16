import { AsyncLocalStorage } from "node:async_hooks";
import { normalizeAccountRole } from "./access.js";

export type SignupRole = "student" | "parent" | "organization";

const signupRole = new AsyncLocalStorage<SignupRole>();

export function runWithSignupRole(role: SignupRole, next: () => void) {
  signupRole.run(role, next);
}

export function getSignupRole(): SignupRole {
  return signupRole.getStore() ?? "student";
}

export function roleFromAuthRequest(req: {
  headers: { [key: string]: string | string[] | undefined };
  url?: string;
}): SignupRole {
  const header = String(req.headers["x-kleva-role"] ?? "").toLowerCase();
  let query = "";
  try {
    query = new URL(req.url ?? "", "http://localhost").searchParams.get("role") ?? "";
  } catch {
    query = "";
  }
  const value = header || query;
  const role = normalizeAccountRole(value);
  if (role === "parent" || role === "organization") return role;
  return "student";
}
