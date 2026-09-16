import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DataTable,
  PageHeader,
  StatusPill,
  money,
  useDemo,
} from "./shared";

export default function SchoolFees() {
  const { demo } = useDemo();
  const [tab, setTab] = useState(demo.feesTabs[0]!);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Fees & Finance"
        subtitle="Collections, schedules, arrears and audit trail."
      />

      <div className="flex flex-wrap gap-2">
        {demo.feesTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors border",
              tab === t
                ? "border-foreground/30 bg-transparent text-foreground font-semibold"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Payments" && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent payments</h2>
            <p className="page-subtitle mt-0.5">
              Bank transfers, cash receipts and mobile money.
            </p>
          </div>
          <DataTable headers={["Date", "Student", "Method", "Reference", "Received by", "Amount"]}>
            {demo.recentPayments.map((p) => (
              <tr key={p.reference} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.student}</p>
                  <p className="text-xs text-muted-foreground">{p.form}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    tone={p.method === "Cash" ? "neutral" : "good"}
                  >
                    {p.method}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.reference}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.receivedBy}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{money(p.amount)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {tab !== "Payments" && (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          {tab} view is cosmetic for now — sample data lives under Payments.
        </div>
      )}
    </div>
  );
}
