import { useMemo, useState } from "react";
import { Input } from "@nudle/ui/input";
import { Badge } from "@nudle/ui/badge";
import { cn } from "@/lib/utils";
import { useSchool } from "@/contexts/SchoolContext";
import { getSchoolDemo, metricTone } from "@/data/school-demo";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle mt-1 max-w-2xl">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("rounded-full bg-card", className)}
    />
  );
}

export function KpiGrid({
  items,
}: {
  items: { label: string; value: string | number; tone?: "default" | "good" | "warn" | "bad" }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="surface-card p-5">
          <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
          <p
            className={cn(
              "text-3xl font-semibold tracking-tight",
              item.tone === "good" && "metric-good",
              item.tone === "warn" && "metric-warn",
              item.tone === "bad" && "metric-bad",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MetricBar({
  label,
  value,
  display,
  good = 85,
  warn = 70,
}: {
  label: string;
  value: number;
  display?: string;
  good?: number;
  warn?: number;
}) {
  const tone = metricTone(value, good, warn);
  const width = Math.max(0, Math.min(100, value > 24 ? value : (value / 24) * 100));
  return (
    <div className="min-w-0">
      <div className="flex justify-between gap-2 text-xs mb-1.5">
        <span className="text-muted-foreground truncate">{label}</span>
        <span
          className={cn(
            "font-medium tabular-nums",
            tone === "good" && "metric-good",
            tone === "warn" && "metric-warn",
            tone === "bad" && "metric-bad",
          )}
        >
          {display ?? `${value}%`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "good" && "bar-good",
            tone === "warn" && "bar-warn",
            tone === "bad" && "bar-bad",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "good",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border-0 font-medium",
        tone === "good" && "badge-good",
        tone === "warn" && "badge-warn",
        tone === "bad" && "badge-bad",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </Badge>
  );
}

export function useDemo() {
  const { activeSchoolId, activeSchool } = useSchool();
  const demo = useMemo(() => getSchoolDemo(activeSchoolId), [activeSchoolId]);
  return { demo, activeSchool, activeSchoolId };
}

export function useFilteredRows<T>(rows: T[], query: string, keys: (row: T) => string) {
  const [q, setQ] = useState(query);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => keys(row).toLowerCase().includes(needle));
  }, [rows, q, keys]);
  return { q, setQ, filtered };
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-muted-foreground">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function money(n: number) {
  return `$${n.toLocaleString()}`;
}
