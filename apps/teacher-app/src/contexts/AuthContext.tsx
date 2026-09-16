import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export type StaffRole = "teacher" | "school_admin";

interface AuthContextType {
  user: { id: string; email: string; name: string } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: StaffRole,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function ensureRole(role: StaffRole) {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();

  const signIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      return { error: new Error(error.message || "Sign in failed") };
    }
    await refetch();
    try {
      const me = await api.get<{ roles: string[] }>("/api/me");
      if (!me.roles.includes("school_admin") && !me.roles.includes("teacher")) {
        await api.post("/api/roles", { role: "teacher" });
      }
    } catch {
      // keep session even if role bootstrap fails
    }
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: StaffRole = "teacher",
  ) => {
    const { error, data } = await authClient.signUp.email({
      email,
      password,
      name: fullName,
      fetchOptions: {
        headers: {
          "x-kleva-role": role,
        },
        query: {
          role,
        },
      },
    });

    if (error) {
      return { error: new Error(error.message || "Sign up failed") };
    }

    if (!data?.token) {
      const signedIn = await authClient.signIn.email({ email, password });
      if (signedIn.error) {
        return {
          error: new Error(signedIn.error.message || "Account created. Please sign in."),
        };
      }
    }

    await refetch();

    try {
      if (role === "teacher") {
        await api.post("/api/roles", { role: "teacher" });
      } else {
        await ensureRole("school_admin");
      }
    } catch (roleError) {
      console.error("Failed to assign role:", roleError);
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
