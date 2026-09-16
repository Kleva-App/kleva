import * as React from "react";
import { cn } from "./lib/utils";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 flex-wrap", className)}>
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle mt-1 max-w-2xl">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
