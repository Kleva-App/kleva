import { Navigate, useParams } from "react-router-dom";
import { getStaffDetail } from "@/data/school-demo";
import { useSchool } from "@/contexts/SchoolContext";
import { MetricBar, StatusPill } from "./shared";
import {
  DetailSection,
  DetailStatGrid,
  PersonDetailShell,
} from "./PersonDetailShell";

export default function StaffDetailPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const { activeSchoolId } = useSchool();
  const staff = getStaffDetail(activeSchoolId, staffId ?? "");

  if (!staff) {
    return <Navigate to="/school/staff" replace />;
  }

  return (
    <PersonDetailShell
      backTo="/school/staff"
      backLabel="Back to staff"
      name={staff.name}
      subtitle={staff.role}
      status={<StatusPill tone={staff.status === "Active" ? "good" : "warn"}>{staff.status}</StatusPill>}
      meta={[
        { label: "Employee ID", value: staff.employeeId },
        { label: "Department", value: staff.department },
        { label: "Email", value: staff.email },
        { label: "Phone", value: staff.phone },
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
                  { label: "Grading timeliness", value: `${staff.gradingTimeliness}%`, tone: "good" },
                  { label: "Registers marked", value: `${staff.registersMarked}%`, tone: "good" },
                  { label: "Own attendance", value: `${staff.ownAttendance}%`, tone: "good" },
                  {
                    label: "Class average",
                    value: `${staff.classAverage}%`,
                    tone: staff.classAverage >= 75 ? "good" : "warn",
                  },
                ]}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DetailSection title="Performance indicators" subtitle="Separate metrics — not a single score.">
                  <div className="space-y-4">
                    <MetricBar label="Grading timeliness" value={staff.gradingTimeliness} />
                    <MetricBar label="Registers marked" value={staff.registersMarked} />
                    <MetricBar label="Own attendance" value={staff.ownAttendance} />
                    <MetricBar label="Class average" value={staff.classAverage} good={75} warn={65} />
                    <MetricBar
                      label="Parent reply time"
                      value={Math.max(0, 100 - staff.parentReplyHrs * 4)}
                      display={`${staff.parentReplyHrs} hrs`}
                      good={80}
                      warn={50}
                    />
                  </div>
                </DetailSection>
                <DetailSection title="Notes" subtitle="Internal context for leadership.">
                  <ul className="space-y-3">
                    {staff.notes.map((note) => (
                      <li
                        key={note}
                        className="text-sm text-muted-foreground leading-relaxed rounded-xl border border-border/50 px-3.5 py-3"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                      Qualifications
                    </p>
                    <ul className="space-y-1">
                      {staff.qualifications.map((q) => (
                        <li key={q} className="font-medium">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </DetailSection>
              </div>
            </div>
          ),
        },
        {
          id: "classes",
          label: "Classes",
          content: (
            <DetailSection title="Assigned classes" subtitle={`Joined ${staff.joined}`}>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border/50">
                      <th className="pb-2 font-medium">Class</th>
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 font-medium">Students</th>
                      <th className="pb-2 font-medium">Room</th>
                      <th className="pb-2 font-medium">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.classes.map((c) => (
                      <tr key={c.name} className="border-b border-border/40 last:border-0">
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3 text-muted-foreground">{c.subject}</td>
                        <td className="py-3 tabular-nums">{c.students || "—"}</td>
                        <td className="py-3">{c.room}</td>
                        <td className="py-3 text-muted-foreground">{c.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetailSection>
          ),
        },
        {
          id: "grading",
          label: "Grading",
          content: (
            <DetailSection
              title="Recent grading"
              subtitle="Assessments due and how quickly they were returned."
            >
              <div className="space-y-3">
                {staff.recentGrading.map((g) => (
                  <div
                    key={`${g.assignment}-${g.className}`}
                    className="rounded-xl border border-border/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">{g.assignment}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {g.className} · Due {g.due} · Graded {g.graded}
                      </p>
                    </div>
                    <StatusPill tone={g.pending === 0 ? "good" : "warn"}>
                      {g.pending === 0 ? "Complete" : `${g.pending} pending`}
                    </StatusPill>
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
            <DetailSection title="Own attendance log" subtitle="Last two weeks of staff presence.">
              <div className="space-y-2">
                {staff.attendanceLog.map((a) => (
                  <div
                    key={a.date}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium tabular-nums">{a.date}</p>
                      {a.note ? (
                        <p className="text-xs text-muted-foreground mt-0.5">{a.note}</p>
                      ) : null}
                    </div>
                    <StatusPill
                      tone={
                        a.status === "Present" ? "good" : a.status === "Late" ? "warn" : "neutral"
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
          id: "messages",
          label: "Messages",
          content: (
            <DetailSection title="Recent threads" subtitle="Staff and parent conversations.">
              <div className="space-y-3">
                {staff.messages.map((m) => (
                  <div
                    key={m.subject}
                    className="rounded-xl border border-border/50 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{m.with}</p>
                        {m.unread ? <StatusPill tone="good">Unread</StatusPill> : null}
                      </div>
                      <p className="text-sm mt-1">{m.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{m.date}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          ),
        },
      ]}
    />
  );
}
