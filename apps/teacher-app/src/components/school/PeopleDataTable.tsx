import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { SurfaceCard } from "@nudle/ui/surface-card";
import { cn } from "@/lib/utils";

export type PeopleColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PeopleDataTable<T extends { id: string; name: string }>({
  rows,
  columns,
  subtitle,
  status,
  onRowClick,
  emptyMessage = "No results",
  toolbar,
}: {
  rows: T[];
  columns: PeopleColumn<T>[];
  subtitle: (row: T) => string;
  status?: (row: T) => ReactNode;
  onRowClick: (row: T) => void;
  emptyMessage?: string;
  toolbar?: ReactNode;
}) {
  return (
    <SurfaceCard className="overflow-hidden">
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border/50">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium whitespace-nowrap min-w-[200px]">Name</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 font-medium whitespace-nowrap", col.className)}
                >
                  {col.header}
                </th>
              ))}
              {status ? (
                <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
              ) : null}
              <th className="px-3 py-3 w-10" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (status ? 3 : 2)}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  className="group border-b border-border/40 last:border-0 cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 group-hover:bg-muted/80">
                        {initials(row.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate group-hover:underline underline-offset-2">
                          {row.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {subtitle(row)}
                        </p>
                      </div>
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3.5 whitespace-nowrap", col.className)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {status ? <td className="px-4 py-3.5">{status(row)}</td> : null}
                  <td className="px-3 py-3.5 text-muted-foreground">
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
