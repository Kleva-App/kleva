import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { PageHeader, StatusPill, useDemo } from "./shared";

export default function SchoolAttendancePage() {
  const { demo } = useDemo();
  const [form, setForm] = useState(demo.formAttendance[0]?.form ?? "Form 1");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle="School-wide trend, then drill down by form and class."
      />

      <div className="surface-card p-5 md:p-6">
        <p className="text-sm font-semibold mb-4">Attendance trend</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demo.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(152 45% 48%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(152 45% 48%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Drill down by grade</p>
        <div className="flex flex-wrap gap-2">
          {demo.formAttendance.map((f) => (
            <button
              key={f.form}
              type="button"
              onClick={() => setForm(f.form)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                form === f.form
                  ? "bg-white text-black font-semibold"
                  : "bg-card text-muted-foreground border border-border/60",
              )}
            >
              {f.form} · {f.rate}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demo.classAttendance.map((c) => (
          <div key={c.name} className="surface-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.teacher} · {c.students} students
                </p>
              </div>
              <StatusPill tone={c.rate >= 92 ? "good" : "warn"}>{c.rate}%</StatusPill>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  c.rate >= 92 ? "bar-good" : "bar-warn",
                )}
                style={{ width: `${c.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Students in {form}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demo.studentAttendance.map((s) => (
            <div
              key={s.name}
              className="surface-card px-4 py-3 flex items-center justify-between gap-3"
            >
              <p className="text-sm font-medium">{s.name}</p>
              <StatusPill tone={s.rate >= 85 ? "good" : "bad"}>{s.rate}%</StatusPill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
