import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type StaffRole } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import { useToast } from "@nudle/ui/use-toast";
import { cn } from "@/lib/utils";
import klevaMark from "@/assets/kleva-mark.svg";

const STAFF_ROLES: Array<{ id: StaffRole; label: string }> = [
  { id: "teacher", label: "Teacher" },
  { id: "school_admin", label: "School Admin" },
];

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<StaffRole>("teacher");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        try {
          const me = await api.get<{ roles: string[] }>("/api/me");
          if (me.roles.includes("school_admin") && !me.roles.includes("teacher")) {
            navigate("/school");
            return;
          }
        } catch {
          // fall through to home
        }
        navigate("/");
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) throw error;
        navigate(role === "school_admin" ? "/school" : "/");
      }
    } catch (err) {
      toast({
        title: "Authentication failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md surface-card p-8">
        <div className="mb-6 text-center">
          <img src={klevaMark} alt="Kleva" className="h-16 w-16 mx-auto mb-3" />
          <p className="text-sm font-medium tracking-wide text-muted-foreground mb-2">
            Kleva Educators
          </p>
          <h1 className="page-title text-2xl">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="page-subtitle mt-1">
            {role === "school_admin"
              ? "Manage schools, staff, and school health"
              : "Access courses, grading, and attendance"}
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account type</Label>
            <div className="grid grid-cols-2 gap-2">
              {STAFF_ROLES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    role === option.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted/60",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <Button
          variant="link"
          className="w-full mt-3 rounded-full"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
}
