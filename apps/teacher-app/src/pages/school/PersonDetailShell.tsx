import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nudle/ui/tabs";
import { Button } from "@nudle/ui/button";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/pages/school/shared";

export function PersonDetailShell({
  backTo,
  backLabel,
  name,
  subtitle,
  status,
  meta,
  tabs,
  defaultTab,
}: {
  backTo: string;
  backLabel: string;
  name: string;
  subtitle: string;
  status?: React.ReactNode;
  meta: { label: string; value: string }[];
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Button asChild variant="ghost" className="rounded-full -ml-2 mb-3 h-9 px-3 text-muted-foreground">
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {backLabel}
          </Link>
        </Button>

        <div className="surface-card p-5 md:p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="page-title text-2xl md:text-3xl">{name}</h1>
                {status}
              </div>
              <p className="page-subtitle mt-1">{subtitle}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {meta.map((m) => (
                  <div key={m.label} className="rounded-xl bg-muted/40 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="text-sm font-medium mt-0.5 truncate">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="h-auto flex flex-wrap gap-1 rounded-full bg-muted/60 p-1 w-full md:w-auto justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-full px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:outline-none">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function DetailSection({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-5 md:p-6 space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="page-subtitle mt-0.5">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function DetailStatGrid({
  items,
}: {
  items: { label: string; value: string; tone?: "good" | "warn" | "bad" | "default" }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border/50 px-3.5 py-3">
          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums",
              item.tone === "good" && "metric-good",
              item.tone === "warn" && "metric-warn",
              item.tone === "bad" && "metric-bad",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export { StatusPill };
