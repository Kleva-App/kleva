import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { SurfaceCard } from "./surface-card";

export type SiteAccessGateProps = {
  children: ReactNode;
  checkAccess: () => Promise<boolean>;
  unlock: (password: string) => Promise<void>;
  markSrc?: string;
  productLabel?: string;
};

export function SiteAccessGate({
  children,
  checkAccess,
  unlock,
  markSrc,
  productLabel = "Kleva",
}: SiteAccessGateProps) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkAccess()
      .then((ok) => {
        if (!cancelled) setStatus(ok ? "open" : "locked");
      })
      .catch(() => {
        if (!cancelled) setStatus("locked");
      });
    return () => {
      cancelled = true;
    };
  }, [checkAccess]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await unlock(password);
      setStatus("open");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "open") return <>{children}</>;

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <SurfaceCard className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          {markSrc ? (
            <img src={markSrc} alt={productLabel} className="mx-auto mb-3 h-16 w-16" />
          ) : null}
          <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground">
            {productLabel}
          </p>
          <h1 className="page-title text-2xl">Private preview</h1>
          <p className="page-subtitle mt-1">Enter the access password to continue.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-access-password">Password</Label>
            <Input
              id="site-access-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              autoComplete="off"
              required
              className="rounded-xl"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? "Checking…" : "Continue"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}
