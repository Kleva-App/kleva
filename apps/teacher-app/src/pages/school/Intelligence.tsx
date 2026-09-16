import { cn } from "@/lib/utils";
import { PageHeader, useDemo } from "./shared";

export default function SchoolIntelligence() {
  const { demo } = useDemo();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Kleva Intelligence"
        subtitle="Cosmetic insights surfaced for the head of school — no model calls yet."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {demo.intelligence.map((item) => (
          <div key={item.title} className="surface-card p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  item.severity === "ok" && "bg-emerald-400",
                  item.severity === "warn" && "bg-amber-400",
                  item.severity === "info" && "bg-sky-400",
                )}
              />
              <p className="font-semibold">{item.title}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
