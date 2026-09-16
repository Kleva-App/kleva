import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@nudle/ui/button";
import { SurfaceCard } from "@nudle/ui/surface-card";
import { StatCard } from "@nudle/ui/stat-card";
import { cn } from "@/lib/utils";
import { KpiGrid, money, PageHeader, StatusPill, useDemo } from "./shared";

const chartTooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
};

const STAGE_ORDER = [
  "Enquiry",
  "Application",
  "Assessment",
  "Offer",
  "Enrolled",
] as const;

export default function SchoolDashboard() {
  const { demo, activeSchool } = useDemo();

  const attendanceLatest =
    demo.attendanceTrend[demo.attendanceTrend.length - 1]?.rate ?? 0;
  const studentsOnRoll = demo.students.length;
  const needingAttention = demo.students.filter(
    (s) => s.alerts.length > 0 || s.status === "Requires attention",
  );
  const arrearsTotal = demo.students.reduce((sum, s) => sum + Math.max(0, s.balance), 0);
  const avgAttainment = Math.round(
    demo.students.reduce((sum, s) => sum + s.average, 0) / Math.max(1, demo.students.length),
  );

  const admissionsFunnel = STAGE_ORDER.map((stage) => ({
    stage,
    count: demo.applicants.filter((a) => a.stage === stage).length,
  })).filter((row) => row.count > 0 || ["Enquiry", "Application"].includes(row.stage));

  const formBands = Array.from(
    new Set(demo.students.map((s) => s.formBand)),
  ).map((band) => ({
    name: band,
    students: demo.students.filter((s) => s.formBand === band).length,
  }));

  const formColors = [
    "hsl(168 50% 42%)",
    "hsl(220 60% 55%)",
    "hsl(38 80% 50%)",
    "hsl(280 40% 55%)",
    "hsl(152 45% 48%)",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`${activeSchool?.name ?? demo.schoolName} · overview of people, learning and money.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/school/intelligence">
              View intelligence
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Students on roll"
          value={studentsOnRoll}
          icon={Users}
          compact
        />
        <StatCard
          label="Staff on roll"
          value={demo.staffKpis.onRoll}
          icon={GraduationCap}
          compact
        />
        <StatCard
          label="Attendance"
          value={`${attendanceLatest}%`}
          icon={ClipboardCheck}
          tone={attendanceLatest >= 90 ? "good" : attendanceLatest >= 80 ? "warn" : "bad"}
          compact
        />
        <StatCard
          label="Fee arrears"
          value={money(arrearsTotal)}
          icon={Wallet}
          tone={arrearsTotal > 1000 ? "bad" : arrearsTotal > 0 ? "warn" : "good"}
          compact
        />
      </div>

      <KpiGrid
        items={[
          {
            label: "Avg attainment",
            value: `${avgAttainment}%`,
            tone: avgAttainment >= 70 ? "good" : avgAttainment >= 60 ? "warn" : "bad",
          },
          {
            label: "Registers marked",
            value: `${demo.staffKpis.registersMarked}%`,
            tone: "good",
          },
          {
            label: "Admissions pipeline",
            value: demo.admissionsKpis.inPipeline,
          },
          {
            label: "Net cash (period)",
            value: money(demo.accountingKpis.net),
            tone: "good",
          },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SurfaceCard className="xl:col-span-2 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold">Attendance trend</p>
              <p className="page-subtitle mt-0.5">School-wide daily register rate</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/attendance">
                Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demo.attendanceTrend}>
                <defs>
                  <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152 45% 48%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(152 45% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(152 45% 48%)"
                  strokeWidth={2.5}
                  fill="url(#attendanceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 md:p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold">Enrolment by form</p>
            <p className="page-subtitle mt-0.5">Students currently on roll</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formBands}
                  dataKey="students"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {formBands.map((_, i) => (
                    <Cell key={formBands[i].name} fill={formColors[i % formColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {formBands.map((band, i) => (
              <span
                key={band.name}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: formColors[i % formColors.length] }}
                />
                {band.name} · {band.students}
              </span>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SurfaceCard className="xl:col-span-2 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold">Subject performance</p>
              <p className="page-subtitle mt-0.5">Average attainment by subject</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/academics">
                Academics
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
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
                  angle={-18}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  domain={[40, 80]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="average" radius={[8, 8, 0, 0]} fill="hsl(220 55% 52%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold">Admissions funnel</p>
              <p className="page-subtitle mt-0.5">Applicants by stage</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/admissions">
                Pipeline
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionsFunnel} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={88}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="hsl(280 40% 55%)" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SurfaceCard className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">Needs attention</p>
                <p className="page-subtitle mt-0.5">
                  {needingAttention.length} student
                  {needingAttention.length === 1 ? "" : "s"} flagged
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/students">
                All students
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2.5">
            {needingAttention.slice(0, 5).map((student) => (
              <Link
                key={student.id}
                to={`/school/students/${student.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-3.5 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.form}
                    {student.alerts[0] ? ` · ${student.alerts[0].kind}` : ""}
                  </p>
                </div>
                <StatusPill tone="warn">{student.status}</StatusPill>
              </Link>
            ))}
            {needingAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No students currently flagged.
              </p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold">Kleva Intelligence</p>
                <p className="page-subtitle mt-0.5">Signals for leadership</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/intelligence">
                All insights
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {demo.intelligence.slice(0, 4).map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/50 px-3.5 py-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      item.severity === "ok" && "bg-emerald-400",
                      item.severity === "warn" && "bg-amber-400",
                      item.severity === "info" && "bg-sky-400",
                    )}
                  />
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SurfaceCard className="p-5 md:p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Recent fee payments</p>
              <p className="page-subtitle mt-0.5">Latest receipts across the school</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/school/fees">
                Fees
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-muted-foreground">
                  {["Date", "Student", "Method", "Amount"].map((h) => (
                    <th key={h} className="px-2 py-2.5 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demo.recentPayments.slice(0, 5).map((p) => (
                  <tr
                    key={`${p.reference}-${p.date}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-2 py-3 whitespace-nowrap text-muted-foreground">{p.date}</td>
                    <td className="px-2 py-3">
                      <p className="font-medium">{p.student}</p>
                      <p className="text-xs text-muted-foreground">{p.form}</p>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">{p.method}</td>
                    <td className="px-2 py-3 whitespace-nowrap font-semibold tabular-nums">
                      {money(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 md:p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold">Money snapshot</p>
            <p className="page-subtitle mt-0.5">This accounting period</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Income", value: money(demo.accountingKpis.income), tone: "good" as const },
              {
                label: "Expenses",
                value: money(demo.accountingKpis.expenses),
                tone: "default" as const,
              },
              { label: "Net", value: money(demo.accountingKpis.net), tone: "good" as const },
              {
                label: "Awaiting approval",
                value: String(demo.accountingKpis.awaiting),
                tone: "warn" as const,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-3"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    row.tone === "good" && "text-emerald-600 dark:text-emerald-400",
                    row.tone === "warn" && "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/school/accounting">Open accounting</Link>
          </Button>
        </SurfaceCard>
      </div>
    </div>
  );
}
