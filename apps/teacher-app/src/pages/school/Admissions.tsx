import { KpiGrid, PageHeader, useDemo } from "./shared";
import type { Applicant } from "@/data/school-demo";

const STAGES: Applicant["stage"][] = [
  "Enquiry",
  "Application",
  "Assessment",
  "Offer",
  "Enrolled",
];

export default function SchoolAdmissions() {
  const { demo } = useDemo();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Admissions"
        subtitle="Follow applicants from enquiry through to enrolment."
      />

      <KpiGrid
        items={[
          { label: "Open places", value: demo.admissionsKpis.openPlaces },
          { label: "Applicants in pipeline", value: demo.admissionsKpis.inPipeline },
          {
            label: "Offers out",
            value: demo.admissionsKpis.offersOut,
            tone: "warn",
          },
          {
            label: "Enrolled this cycle",
            value: demo.admissionsKpis.enrolledThisCycle,
            tone: "good",
          },
        ]}
      />

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-[900px]">
          {STAGES.map((stage) => {
            const cards = demo.applicants.filter((a) => a.stage === stage);
            return (
              <div key={stage} className="flex-1 min-w-[180px] space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-semibold">{stage}</p>
                  <span className="text-xs text-muted-foreground">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((a) => (
                    <div key={a.id} className="surface-card p-3.5 space-y-1.5">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.form}</p>
                      <p className="text-xs text-muted-foreground">Guardian: {a.guardian}</p>
                      <p className="text-[11px] text-muted-foreground/80">{a.submitted}</p>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground text-center">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
