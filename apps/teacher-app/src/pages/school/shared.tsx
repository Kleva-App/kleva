import { useMemo, useState } from "react";
import { Input } from "@nudle/ui/input";
import { Badge } from "@nudle/ui/badge";
import { PageHeader } from "@nudle/ui/page-header";
import { DataTable } from "@nudle/ui/data-table";
import { StatGrid } from "@nudle/ui/stat-card";
import { cn } from "@/lib/utils";
import { useSchool } from "@/contexts/SchoolContext";
import { getSchoolDemo, metricTone } from "@/data/school-demo";

export { PageHeader, DataTable };
export { StatGrid as KpiGrid };

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

export function money(n: number) {
  return `$${n.toLocaleString()}`;
}
