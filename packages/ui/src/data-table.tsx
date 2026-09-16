import * as React from "react";
import { cn } from "./lib/utils";
import { SurfaceCard } from "./surface-card";

export type DataTableProps = {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  colSpan?: number;
};

/** Simple bordered data table inside a SurfaceCard. Pass <tr> rows as children. */
export function DataTable({
  headers,
  children,
  className,
  emptyMessage,
  colSpan,
}: DataTableProps) {
  const rows = React.Children.toArray(children);
  const span = colSpan ?? headers.length;

  return (
    <SurfaceCard className={cn("overflow-hidden", className)}>
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
          <tbody>
            {rows.length === 0 && emptyMessage ? (
              <tr>
                <td colSpan={span} className="px-4 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

export type DataTableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  clickable?: boolean;
};

export function DataTableRow({ className, clickable, ...props }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border/40 last:border-0",
        clickable &&
          "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3.5", className)} {...props} />;
}
