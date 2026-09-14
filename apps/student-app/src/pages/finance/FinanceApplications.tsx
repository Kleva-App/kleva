import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Store,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@nudle/ui/button";
import { api } from "@/lib/api";

type Status = "Approved" | "Under Review" | "Declined";

type Application = {
  id: string;
  publicRef: string;
  product: string;
  facility: string;
  amount: string;
  submitted: string;
  status: Status;
  note: string;
  school?: {
    name: string;
    level: string;
    province: string;
    district: string;
    bank?: string;
    accountNumber?: string;
  } | null;
  progress?: { paid: number; total: number };
};

const FACILITIES = [
  {
    icon: Zap,
    name: "Utilities credit line",
    detail: "ZESA, ZINWA & airtime on credit — settle within 30 days",
    used: 45,
    limit: 300,
  },
  {
    icon: GraduationCap,
    name: "Education Finance facility",
    detail: "Approved education loans appear here after disbursement",
    used: 0,
    limit: 900,
  },
];

const statusStyles: Record<Status, { badge: string; icon: typeof Clock3; iconColor: string }> = {
  Approved: {
    badge: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  "Under Review": {
    badge: "bg-amber-500/10 text-amber-600",
    icon: Clock3,
    iconColor: "text-amber-600",
  },
  Declined: {
    badge: "bg-destructive/10 text-destructive",
    icon: XCircle,
    iconColor: "text-destructive",
  },
};

function productIcon(product: string) {
  if (product.toLowerCase().includes("school")) return Building2;
  if (product.toLowerCase().includes("supplier") || product.toLowerCase().includes("order")) {
    return Truck;
  }
  if (product.toLowerCase().includes("sme")) return Store;
  return GraduationCap;
}

export default function FinanceApplications() {
  const { data: applications = [], isPending } = useQuery({
    queryKey: ["finance-applications"],
    queryFn: () => api.get<Application[]>("/api/finance/applications"),
  });

  const counts = {
    total: applications.length,
    approved: applications.filter((a) => a.status === "Approved").length,
    review: applications.filter((a) => a.status === "Under Review").length,
    declined: applications.filter((a) => a.status === "Declined").length,
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle mt-1">
            Track every Blue Finance application and facility linked to your account.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/finance/apply">New application</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.total, color: "text-foreground" },
          { label: "Approved", value: counts.approved, color: "text-emerald-600" },
          { label: "Under review", value: counts.review, color: "text-amber-600" },
          { label: "Declined", value: counts.declined, color: "text-destructive" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Active facilities</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FACILITIES.map((f) => {
            const pct = Math.round((f.used / f.limit) * 100);
            return (
              <div key={f.name} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{f.detail}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ${f.used} of ${f.limit} used · {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">All applications</h2>
        {isPending ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading applications…</p>
        ) : applications.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply for education finance to track status, disbursements and instalments here.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link to="/finance/apply">Start an application</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {applications.map((a) => {
              const s = statusStyles[a.status] ?? statusStyles["Under Review"];
              const StatusIcon = s.icon;
              const Icon = productIcon(a.product);
              const submitted = new Date(a.submitted);
              const submittedLabel = Number.isNaN(submitted.getTime())
                ? a.submitted
                : submitted.toLocaleDateString();
              const amount = a.amount.startsWith("$") ? a.amount : `$${a.amount}`;
              return (
                <div key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{a.product}</p>
                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{a.facility}</p>
                      {a.school?.name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.school.name}
                          {a.school.level === "primary"
                            ? " · Primary"
                            : a.school.level === "secondary"
                              ? " · High school"
                              : ""}
                          {a.school.province ? ` · ${a.school.province}` : ""}
                          {a.school.bank && a.school.accountNumber
                            ? ` · ${a.school.bank} ${a.school.accountNumber}`
                            : ""}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ref {a.publicRef} · Submitted {submittedLabel}
                      </p>
                    </div>
                    <p className="text-base font-bold text-foreground">{amount}</p>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                    <StatusIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.iconColor}`} />
                    <span>{a.note}</span>
                  </div>

                  {a.progress && (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            a.progress.paid === a.progress.total ? "bg-emerald-500" : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.round((a.progress.paid / a.progress.total) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {a.progress.paid} of {a.progress.total} instalments paid
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
