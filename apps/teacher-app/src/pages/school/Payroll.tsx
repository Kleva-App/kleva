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

export default function SchoolPayroll() {
  const { demo } = useDemo();
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payroll"
        subtitle={demo.payrollPeriod}
        action={
          <Button
            className="rounded-full"
            onClick={() =>
              toast({
                title: "Payroll run submitted",
                description: "Draft rows remain editable until approved.",
              })
            }
          >
            Submit run
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Gross pay", value: money(demo.payrollKpis.gross) },
          { label: "Deductions", value: money(demo.payrollKpis.deductions) },
          { label: "Net payable", value: money(demo.payrollKpis.net), tone: "good" },
          { label: "Still in draft", value: demo.payrollKpis.draft, tone: "warn" },
        ]}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Staff payroll</h2>
        <DataTable headers={["Name", "Role", "Gross", "Deductions", "Net", "Status"]}>
          {demo.payroll.map((r) => (
            <tr key={r.name} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{r.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
              <td className="px-4 py-3 tabular-nums">{money(r.gross)}</td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                -{money(r.deductions)}
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">{money(r.net)}</td>
              <td className="px-4 py-3">
                <StatusPill tone={r.status === "Approved" ? "good" : "warn"}>
                  {r.status}
                </StatusPill>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
