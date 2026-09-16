import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@nudle/ui/button";
import { cn } from "@/lib/utils";
import { MetricBar, PageHeader, useDemo } from "./shared";

export default function SchoolAcademics() {
  const { demo } = useDemo();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Academics"
        subtitle="Subject performance, curriculum coverage and grading backlog."
      />

      <div className="surface-card p-5 md:p-6">
        <p className="text-sm font-semibold mb-4">Subject performance</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demo.subjects}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[40, 70]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="average" radius={[8, 8, 0, 0]} fill="hsl(168 50% 42%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="surface-card p-5 md:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Curriculum progress</h2>
            <p className="page-subtitle mt-0.5">Share of the term's scheme of work covered.</p>
          </div>
          <div className="space-y-4">
            {demo.curriculum.map((row) => (
              <MetricBar
                key={row.name}
                label={row.name}
                value={row.progress || 1}
                display={`${row.progress}%`}
                good={75}
                warn={50}
              />
            ))}
          </div>
        </div>

        <div className="surface-card p-5 md:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Missing grades</h2>
            <p className="page-subtitle mt-0.5">
              Assessments recorded in the plan but not yet graded.
            </p>
          </div>
          <div className="space-y-3">
            {demo.missingGrades.map((row) => (
              <div
                key={row.subject}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-3.5 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{row.subject}</p>
                  <p className="text-xs text-muted-foreground">{row.missing} missing</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    row.status === "Chase now" && "border-red-500/40 text-red-400",
                    row.status === "In progress" && "border-amber-500/40 text-amber-400",
                  )}
                >
                  {row.status}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
