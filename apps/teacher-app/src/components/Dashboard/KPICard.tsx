import type { LucideIcon } from "lucide-react";
import { StatCard } from "@nudle/ui/stat-card";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const KPICard = ({ title, value, icon, trend }: KPICardProps) => {
  return <StatCard label={title} value={value} icon={icon} trend={trend} />;
};
