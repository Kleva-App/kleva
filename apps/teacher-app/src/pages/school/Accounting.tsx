import { useState } from "react";
import { Button } from "@nudle/ui/button";
import { useToast } from "@nudle/ui/use-toast";
import {
  DataTable,
  KpiGrid,
  PageHeader,
  StatusPill,
  money,
  useDemo,
} from "./shared";

export default function SchoolAccounting() {
  const { demo } = useDemo();
  const { toast } = useToast();
  const [rows, setRows] = useState(demo.ledger);

  const approve = (reference: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.reference === reference ? { ...r, status: "Approved" as const } : r,
      ),
    );
    toast({ title: "Entry approved", description: reference });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Accounting"
        subtitle="Journal entries for the current month, ready for approval and export."
      />

      <KpiGrid
        items={[
          { label: "Income posted", value: money(demo.accountingKpis.income), tone: "good" },
          { label: "Expenses posted", value: money(demo.accountingKpis.expenses) },
          { label: "Net position", value: money(demo.accountingKpis.net), tone: "good" },
          { label: "Awaiting approval", value: demo.accountingKpis.awaiting, tone: "warn" },
        ]}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">General ledger</h2>
        <DataTable
          headers={["Date", "Reference", "Account", "Type", "Approver", "Status", "Amount", ""]}
        >
          {rows.map((r) => (
            <tr key={r.reference} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
              <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
              <td className="px-4 py-3">{r.account}</td>
              <td className="px-4 py-3">
                {r.type === "Income" ? (
                  <StatusPill tone="good">Income</StatusPill>
                ) : (
                  <span className="text-muted-foreground">Expense</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.approver}</td>
              <td className="px-4 py-3">
                <StatusPill tone={r.status === "Approved" ? "good" : "warn"}>
                  {r.status}
                </StatusPill>
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">{money(r.amount)}</td>
              <td className="px-4 py-3 text-right">
                {r.status === "Pending approval" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => approve(r.reference)}
                  >
                    Approve
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
