import * as React from "react";
import { cn } from "./lib/utils";

/** Shared content column: max-w-7xl + student/family horizontal margins. */
export const pageContentClass =
  "mx-auto w-full min-w-0 max-w-7xl space-y-6 px-5 py-5 pb-10 sm:px-6 md:p-8";

export const pageBarClass =
  "mx-auto flex w-full min-w-0 max-w-7xl px-5 sm:px-6 md:px-8";

export type PageShellProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `content` = main page column; `bar` = header/footer alignment strip. */
  variant?: "content" | "bar";
};

export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, variant = "content", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(variant === "bar" ? pageBarClass : pageContentClass, className)}
      {...props}
    />
  ),
);
PageShell.displayName = "PageShell";
