import { AsyncLocalStorage } from "node:async_hooks";

export type SignupRole = "student" | "parent" | "institution";

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
  if (value === "parent" || value === "institution") return value;
  return "student";
}
