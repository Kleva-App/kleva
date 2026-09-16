import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./lib/utils";
import { SurfaceCard } from "./surface-card";

export type StatTone = "default" | "good" | "warn" | "bad";

export type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: StatTone;
  trend?: { value: string; positive: boolean };
  className?: string;
  compact?: boolean;
};

const toneClass: Record<StatTone, string> = {
  default: "text-foreground",
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-red-600 dark:text-red-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  trend,
  className,
  compact,
}: StatCardProps) {
  return (
    <SurfaceCard
      className={cn(
        "transition-shadow duration-200 hover:shadow-md",
        compact ? "p-5" : "p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className={cn("text-3xl font-semibold tracking-tight tabular-nums", toneClass[tone])}>
          {value}
        </p>
        {trend?.value ? (
          <p
            className={cn(
              "text-sm",
              trend.positive ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

export type StatGridProps = {
  items: {
    label: string;
    value: string | number;
    tone?: StatTone;
    icon?: LucideIcon;
  }[];
  className?: string;
};

export function StatGrid({ items, className }: StatGridProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
          icon={item.icon}
          compact
        />
      ))}
    </div>
  );
}
