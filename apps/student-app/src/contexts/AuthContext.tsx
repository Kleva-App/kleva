import { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authBaseURL, authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export type AccountRole = "student" | "parent" | "institution";

interface AuthContextType {
  user: { id: string; email: string; name: string } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: AccountRole,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function ensureRole(role: AccountRole) {
  if (role === "student") return;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const me = await api.get<{ roles: string[] }>("/api/me");
    if (me.roles.includes(role)) return;
    try {
      await api.post("/api/roles", { role });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }
  throw new Error("Account created, but access could not be set.");
}

function authErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { message?: unknown; error?: unknown };
  if (typeof record.message === "string" && record.message) return record.message;
  if (typeof record.error === "string" && record.error) return record.error;
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  const signIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    return { error: error ? new Error(error.message || "Sign in failed") : null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: AccountRole = "student",
  ) => {
    const url = `${authBaseURL}/api/auth/sign-up/email?role=${encodeURIComponent(role)}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-kleva-role": role,
      },
      body: JSON.stringify({
        email,
        password,
        name: fullName,
      }),
    });

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      return { error: new Error(authErrorMessage(payload, "Sign up failed")) };
    }

    await authClient.getSession();
    try {
      await ensureRole(role);
    } catch (roleError) {
      return {
        error:
          roleError instanceof Error
            ? roleError
            : new Error("Account created, but access could not be set."),
      };
    }
    return { error: null };
  };

  const signOut = async () => {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: ["me"] });
  };

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signOut, loading: isPending }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
