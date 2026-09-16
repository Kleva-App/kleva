import { Download } from "lucide-react";
import { Button } from "@nudle/ui/button";
import { useToast } from "@nudle/ui/use-toast";
import { PageHeader, useDemo } from "./shared";

export default function SchoolReports() {
  const { demo } = useDemo();
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Term packs, registry, fees and enrolment exports."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demo.reports.map((r) => (
          <div key={r.title} className="surface-card p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
              <p className="text-xs text-muted-foreground mt-2">Updated {r.updated}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => {
                window.print();
                toast({ title: "Export ready", description: r.title });
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
