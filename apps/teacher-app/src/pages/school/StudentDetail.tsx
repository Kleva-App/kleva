import { Navigate, useParams } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getStudentDetail } from "@/data/school-demo";
import { useSchool } from "@/contexts/SchoolContext";
import { StatusPill, money } from "./shared";
import {
  DetailSection,
  DetailStatGrid,
  PersonDetailShell,
} from "./PersonDetailShell";

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { activeSchoolId } = useSchool();
  const student = getStudentDetail(activeSchoolId, studentId ?? "");

  if (!student) {
    return <Navigate to="/school/students" replace />;
  }

  return (
    <PersonDetailShell
      backTo="/school/students"
      backLabel="Back to students"
      name={student.name}
      subtitle={`${student.form} · ${student.house} House`}
      status={
        <StatusPill tone={student.status === "On track" ? "good" : "bad"}>
          {student.status}
        </StatusPill>
      }
      meta={[
        { label: "Student ID", value: student.studentId },
        { label: "Date of birth", value: student.dob },
        { label: "Email", value: student.email },
        { label: "Form band", value: student.formBand },
      ]}
      defaultTab="overview"
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <DetailStatGrid
                items={[
                  {
                    label: "Attendance",
                    value: `${student.attendance}%`,
                    tone: student.attendance >= 85 ? "good" : "bad",
                  },
                  {
                    label: "Average",
                    value: `${student.average}%`,
                    tone: student.average >= 70 ? "good" : "warn",
                  },
                  {
                    label: "Fees balance",
                    value: money(student.balance),
                    tone: student.balance === 0 ? "good" : "warn",
                  },
                  { label: "House", value: student.house },
                ]}
              />
              {student.alerts.length > 0 && (
                <DetailSection title="Attention flags" subtitle="Why this student needs follow-up.">
                  <div className="space-y-3">
                    {student.alerts.map((a) => (
                      <div
                        key={a.kind}
                        className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
                      >
                        <p className="metric-warn font-medium text-sm">{a.kind}</p>
                        <p className="text-sm text-muted-foreground mt-1">{a.detail}</p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
              <DetailSection title="Term history">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border/50">
                        <th className="pb-2 font-medium">Term</th>
                        <th className="pb-2 font-medium">Average</th>
                        <th className="pb-2 font-medium">Rank</th>
                        <th className="pb-2 font-medium">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.termHistory.map((t) => (
                        <tr key={t.term} className="border-b border-border/40 last:border-0">
                          <td className="py-3 font-medium">{t.term}</td>
                          <td className="py-3 tabular-nums">{t.average}%</td>
                          <td className="py-3 tabular-nums">{t.rank}</td>
                          <td className="py-3 tabular-nums">{t.attendance}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailSection>
            </div>
          ),
        },
        {
          id: "academics",
          label: "Academics",
          content: (
            <DetailSection
              title="Subject performance"
              subtitle="Current term marks by subject."
            >
              <div className="space-y-2">
                {student.subjects.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.teacher}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {s.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : s.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-semibold tabular-nums w-12 text-right">{s.mark}%</span>
                      <StatusPill tone={s.grade === "A" || s.grade === "B" ? "good" : "warn"}>
                        {s.grade}
                      </StatusPill>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          ),
        },
        {
          id: "attendance",
          label: "Attendance",
          content: (
            <DetailSection title="Attendance log" subtitle="Recent daily marks.">
              <div className="space-y-2">
                {student.attendanceLog.map((a) => (
                  <div
                    key={a.date}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium tabular-nums">{a.date}</p>
                      {a.period ? (
                        <p className="text-xs text-muted-foreground mt-0.5">{a.period}</p>
                      ) : null}
                    </div>
                    <StatusPill
                      tone={
                        a.status === "Present" ? "good" : a.status === "Late" ? "warn" : "bad"
                      }
                    >
                      {a.status}
                    </StatusPill>
                  </div>
                ))}
              </div>
            </DetailSection>
          ),
        },
        {
          id: "fees",
          label: "Fees",
          content: (
            <div className="space-y-4">
              <DetailStatGrid
                items={[
                  { label: "Term", value: student.fees.term },
                  { label: "Billed", value: money(student.fees.billed) },
                  { label: "Paid", value: money(student.fees.paid), tone: "good" },
                  {
                    label: "Balance",
                    value: money(student.fees.balance),
                    tone: student.fees.balance === 0 ? "good" : "warn",
                  },
                ]}
              />
              <DetailSection title="Payments" subtitle="Receipts applied this term.">
                {student.fees.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border/50">
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Method</th>
                          <th className="pb-2 font-medium">Reference</th>
                          <th className="pb-2 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.fees.payments.map((p) => (
                          <tr key={p.reference} className="border-b border-border/40 last:border-0">
                            <td className="py-3 text-muted-foreground">{p.date}</td>
                            <td className="py-3">{p.method}</td>
                            <td className="py-3 font-mono text-xs text-muted-foreground">
                              {p.reference}
                            </td>
                            <td className="py-3 font-semibold tabular-nums">{money(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DetailSection>
            </div>
          ),
        },
        {
          id: "guardians",
          label: "Guardians",
          content: (
            <div className="space-y-4">
              <DetailSection title="Guardians & contacts">
                <div className="space-y-3">
                  {student.guardians.map((g) => (
                    <div
                      key={g.name + g.phone}
                      className="rounded-xl border border-border/50 px-4 py-3 flex flex-wrap items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{g.name}</p>
                          {g.primary ? <StatusPill tone="good">Primary</StatusPill> : null}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{g.relationship}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p>{g.phone}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{g.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
              <DetailSection title="Pastoral notes" subtitle="Wellbeing and parent meetings.">
                <div className="space-y-3">
                  {student.pastoral.map((p) => (
                    <div
                      key={p.date + p.type}
                      className="rounded-xl border border-border/50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <p className="font-medium text-sm">{p.type}</p>
                        <span className="text-xs text-muted-foreground">{p.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">By {p.by}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.note}</p>
                    </div>
                  ))}
                </div>
              </DetailSection>
            </div>
          ),
        },
      ]}
    />
  );
}
