import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, type AccountRole } from "@/contexts/AuthContext";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nudle/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nudle/ui/tabs";
import { useToast } from "@nudle/ui/use-toast";
import klevaMark from "@/assets/kleva-mark.svg";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: Array<{ id: AccountRole; label: string }> = [
  { id: "student", label: "Student" },
  { id: "parent", label: "Parent" },
  { id: "organization", label: "Organization" },
];

function safeNext(path: string | null) {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return null;
}

function roleFromQuery(role: string | null): AccountRole {
  if (role === "parent") return role;
  if (role === "organization" || role === "organisation" || role === "institution") {
    return "organization";
  }
  return "student";
}

async function loadRoles() {
  const me = await api.get<{ roles: string[] }>("/api/me");
  return me.roles;
}

function defaultPath(role: AccountRole, created: boolean) {
  if (role === "organization") return created ? "/finance/school" : "/finance/home";
  if (role === "parent") return created ? "/family" : "/finance/home";
  return "/";
}

export default function Auth() {
  const [params] = useSearchParams();
  const initialRole = roleFromQuery(params.get("role"));
  const initialTab = params.get("tab") === "signup" ? "signup" : "signin";
  const redirectTo = safeNext(params.get("next"));
  const fromInvite = Boolean(redirectTo?.startsWith("/invite/"));
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<AccountRole>(initialRole);
  const [tab, setTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [resumePath, setResumePath] = useState<string | null>(null);
  const { user, loading, signIn, signUp } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setAccountType(fromInvite ? "student" : roleFromQuery(params.get("role")));
    const fromQuery = params.get("email");
    if (fromQuery) setEmail(fromQuery);
  }, [params, fromInvite]);

  useEffect(() => {
    if (loading || !user) return;
    const dest = resumePath ?? (isLoading ? null : redirectTo);
    if (dest) navigate(dest, { replace: true });
  }, [loading, user, redirectTo, navigate, resumePath, isLoading]);

  const goAfterAuth = async (created: boolean) => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    let roles = await loadRoles();

    if (accountType === "parent" || accountType === "organization") {
      if (!roles.includes(accountType)) {
        await api.post("/api/roles", { role: accountType });
        await queryClient.invalidateQueries({ queryKey: ["me"] });
        roles = await loadRoles();
      }
      if (!roles.includes(accountType)) {
        throw new Error(
          accountType === "organization"
            ? "Organization access could not be enabled for this account."
            : "Parent access could not be enabled for this account.",
        );
      }
    }

    if (redirectTo) {
      setResumePath(redirectTo);
      return;
    }

    if (accountType === "parent" || roles.includes("parent")) {
      toast({
        title: created ? "Parent account created" : "Welcome back!",
        description: created
          ? "Finance is ready. Invite a student from Family when you want to view their portal."
          : "Signed in to the parent portal.",
      });
      setResumePath(defaultPath("parent", created));
      return;
    }

    if (accountType === "organization" || roles.includes("organization")) {
      toast({
        title: created ? "Organization account created" : "Welcome back!",
        description: created
          ? "You can apply for working capital and infrastructure finance."
          : "Signed in to the organization portal.",
      });
      setResumePath(defaultPath("organization", created));
      return;
    }

    toast({
      title: created ? "Account created!" : "Welcome back!",
      description: created ? "Successfully signed up. Welcome!" : "Successfully signed in.",
    });
    setResumePath("/");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
    } else {
      try {
        await goAfterAuth(false);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Could not finish sign in",
          description: err instanceof Error ? err.message : "Signed in, but access could not be set.",
        });
        setResumePath(redirectTo || "/");
      }
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Full name required",
        description: "Please enter your full name",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      email,
      password,
      fullName,
      fromInvite ? "student" : accountType,
    );

    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message,
      });
    } else {
      try {
        await goAfterAuth(true);
      } catch {
        setResumePath(redirectTo || defaultPath(accountType, true));
      }
    }

    setIsLoading(false);
  };

  const heading =
    accountType === "organization"
      ? "Organization Portal"
      : accountType === "parent"
        ? "Parent Portal"
        : "Student Portal";
  const description =
    accountType === "organization"
      ? "Sign in to apply for working capital and infrastructure finance"
      : accountType === "parent"
        ? "Sign in to manage finances and your child's school portal"
        : "Sign in to access your courses and assignments";

  if (user && (resumePath || (redirectTo && !isLoading))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Taking you in…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md surface-card border-border/80 shadow-elevated">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <img src={klevaMark} alt="Kleva" className="h-16 w-16" />
          </div>
          <div>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Kleva</p>
            <CardTitle className="text-2xl font-semibold tracking-tight">{heading}</CardTitle>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!fromInvite && (
            <div className="mb-5 space-y-2">
              <Label>Account type</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAccountType(type.id)}
                    className={cn(
                      "rounded-full border px-2 py-2 text-xs sm:text-sm transition-colors",
                      accountType === type.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Tabs value={tab} onValueChange={(value) => setTab(value as "signin" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full p-1 h-auto bg-muted">
              <TabsTrigger value="signin" className="rounded-full">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    {accountType === "organization" ? "Your name" : "Full Name"}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={accountType === "organization" ? "Treasurer or finance officer" : "John Doe"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
                {accountType === "parent" && (
                  <p className="text-xs text-muted-foreground">
                    After signing up, invite your student from Family. Finance is available right away
                    on your parent account.
                  </p>
                )}
                {accountType === "organization" && (
                  <p className="text-xs text-muted-foreground">
                    After signing up you can apply for working capital, fee bridging, and
                    infrastructure finance for your school, church, or small business.
                  </p>
                )}
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? "Creating account…" : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
