import { useNavigate } from "react-router-dom";
import { Button } from "@nudle/ui/button";
import { PeopleDataTable } from "@/components/school/PeopleDataTable";
import {
  KpiGrid,
  PageHeader,
  SearchField,
  StatusPill,
  useDemo,
  useFilteredRows,
} from "./shared";

export default function SchoolStaff() {
  const { demo } = useDemo();
  const navigate = useNavigate();
  const { q, setQ, filtered } = useFilteredRows(
    demo.staff,
    "",
    (row) => `${row.name} ${row.role} ${row.department}`,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Teachers & Staff"
        subtitle="Each person is shown with several separate indicators — Kleva never reduces a teacher to one score."
      />

      <KpiGrid
        items={[
          { label: "Staff on roll", value: demo.staffKpis.onRoll },
          {
            label: "Average grading timeliness",
            value: `${demo.staffKpis.avgGradingTimeliness}%`,
            tone: "good",
          },
          {
            label: "Registers marked",
            value: `${demo.staffKpis.registersMarked}%`,
            tone: "good",
          },
          {
            label: "Below grading target",
            value: demo.staffKpis.belowGradingTarget,
            tone: "warn",
          },
        ]}
      />

      <PeopleDataTable
        rows={filtered}
        subtitle={(row) => row.role}
        onRowClick={(row) => navigate(`/school/staff/${row.id}`)}
        emptyMessage="No staff match your search."
        status={(row) => (
          <StatusPill tone={row.status === "Active" ? "good" : "warn"}>{row.status}</StatusPill>
        )}
        toolbar={
          <>
            <SearchField
              value={q}
              onChange={setQ}
              placeholder="Search by name, role or department"
              className="flex-1 min-w-[200px] max-w-md"
            />
            <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
              Export
            </Button>
          </>
        }
        columns={[
          {
            key: "department",
            header: "Department",
            render: (row) => <span className="text-muted-foreground">{row.department}</span>,
          },
          {
            key: "grading",
            header: "Grading",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.gradingTimeliness}%</span>
            ),
          },
          {
            key: "registers",
            header: "Registers",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.registersMarked}%</span>
            ),
          },
          {
            key: "classAvg",
            header: "Class avg",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.classAverage}%</span>
            ),
          },
          {
            key: "reply",
            header: "Parent reply",
            render: (row) => (
              <span className="font-medium tabular-nums">{row.parentReplyHrs} hrs</span>
            ),
          },
        ]}
      />
    </div>
  );
}
