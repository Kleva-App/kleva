import * as React from "react";
import { cn } from "./lib/utils";

export type SurfaceCardProps = React.HTMLAttributes<HTMLDivElement>;

/** Soft card surface used across dashboards (rounded-2xl, subtle border). */
export const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-border/80 shadow-card",
        className,
      )}
      {...props}
    />
  ),
);
SurfaceCard.displayName = "SurfaceCard";
