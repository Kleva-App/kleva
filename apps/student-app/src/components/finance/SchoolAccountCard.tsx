import { Landmark } from "lucide-react";
import type { SchoolBank } from "@/lib/zimbabwe-schools";

export function SchoolAccountCard({
  school,
  className,
}: {
  school: SchoolBank;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 p-4 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Landmark className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Payment destination
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{school.accountName}</p>
          <p className="mt-0.5 text-sm text-foreground">
            {school.bank}
            {school.branch ? ` · ${school.branch}` : ""}
          </p>
          <p className="mt-1 font-mono text-sm tracking-wide text-foreground">
            {school.accountNumber}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Demo account. Fees for this school are paid here.
          </p>
        </div>
      </div>
    </div>
  );
}
