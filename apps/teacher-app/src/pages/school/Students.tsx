import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@nudle/ui/switch";
import { Label } from "@nudle/ui/label";
import { cn } from "@/lib/utils";
import { PeopleDataTable } from "@/components/school/PeopleDataTable";
import {
  PageHeader,
  SearchField,
  StatusPill,
  money,
  useDemo,
} from "./shared";

const FORM_FILTERS = ["All", "Form 1", "Form 2", "Form 3", "Form 4"] as const;

export default function SchoolStudents() {
  const { demo } = useDemo();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<(typeof FORM_FILTERS)[number]>("All");
  const [attentionOnly, setAttentionOnly] = useState(false);

  const filtered = useMemo(() => {
    return demo.students.filter((s) => {
      if (form !== "All" && s.formBand !== form) return false;
      if (attentionOnly && s.status !== "Requires attention") return false;
      const needle = q.trim().toLowerCase();
      if (needle && !`${s.name} ${s.form}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [demo.students, form, attentionOnly, q]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Students"
        subtitle="Attendance, averages and fee balances — click a student for the full record."
      />

      <PeopleDataTable
        rows={filtered}
        subtitle={(row) => row.form}
        onRowClick={(row) => navigate(`/school/students/${row.id}`)}
        emptyMessage="No students match your filters."
        status={(row) => (
          <StatusPill tone={row.status === "On track" ? "good" : "bad"}>
            {row.status}
          </StatusPill>
        )}
        toolbar={
          <>
            <SearchField
              value={q}
              onChange={setQ}
              placeholder="Search students…"
              className="min-w-[180px] max-w-sm flex-1"
            />
            <div className="flex flex-wrap gap-2">
              {FORM_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm(f)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    form === f
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border/60",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="attention"
                checked={attentionOnly}
                onCheckedChange={setAttentionOnly}
              />
              <Label htmlFor="attention" className="text-sm cursor-pointer whitespace-nowrap">
                Requires attention only
              </Label>
            </div>
          </>
        }
        columns={[
          {
            key: "stream",
            header: "Form band",
            render: (row) => <span className="text-muted-foreground">{row.formBand}</span>,
          },
          {
            key: "attendance",
            header: "Attendance",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.attendance}%</span>
            ),
          },
          {
            key: "average",
            header: "Average",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.average}%</span>
            ),
          },
          {
            key: "balance",
            header: "Balance",
            render: (row) => (
              <span className="font-medium tabular-nums">{money(row.balance)}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
