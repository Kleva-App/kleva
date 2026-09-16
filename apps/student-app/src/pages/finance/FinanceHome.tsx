import { Link } from "react-router-dom";
import { Building2, CreditCard, GraduationCap, Store, Truck, Zap } from "lucide-react";
import { Button } from "@nudle/ui/button";
import { useSchoolPortalHidden } from "@/components/ParentOnly";
import { ZikimallBanner } from "@/components/ZikimallBanner";
import { useFamily } from "@/contexts/FamilyContext";

const products = [
  {
    icon: GraduationCap,
    title: "Education Finance",
    desc: "For eligible school fees and education expenses.",
    cta: "Apply for Education Finance",
    to: "/finance/apply",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "Organization Finance",
    desc: "For schools, churches, and small businesses needing equipment, working capital or infrastructure.",
    cta: "Explore Organization Finance",
    to: "/finance/school",
    tone: "bg-brand-teal/15 text-brand-teal",
  },
  {
    icon: Truck,
    title: "Supplier / Order Finance",
    desc: "For eligible education suppliers fulfilling school orders.",
    cta: "Explore Supplier Finance",
    to: "/finance/supplier",
    tone: "bg-brand-orange/15 text-brand-orange",
  },
];

export default function FinanceHome() {
  const { activeChild, children, isOrganization } = useFamily();
  const { hidden: schoolPortalHidden, loading } = useSchoolPortalHidden();
  const showAds = !loading && schoolPortalHidden;

  return (
    <div>
      <h1 className="page-title">Kleva Finance</h1>
      <p className="page-subtitle mt-1">
        Powered by Blue Finance
        {activeChild ? ` · Managing ${activeChild.name}` : ""}
      </p>

      {showAds && (
        <div className="mt-6">
          <ZikimallBanner />
        </div>
      )}

      {!isOrganization && children.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-5">
          <p className="text-sm font-medium">Invite a student to view their portal</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finance is available on your parent account now. To see a child&apos;s school pages,
            send an email invite and wait until they accept.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/family">Invite a student</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">Pay school fees</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay straight into the school account by card, bank transfer, mobile money or Kleva wallet.
          </p>
        </div>
        <Button asChild className="rounded-full sm:w-auto">
          <Link to="/finance/pay">Make a payment</Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
          <Zap className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">Buy utilities on credit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ZESA tokens, ZINWA water, council rates, airtime and DStv — pay now or settle in 30 days.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full sm:w-auto">
          <Link to="/finance/utilities">Buy utilities</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.title}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${p.tone}`}>
              <p.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-foreground">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
            <Button asChild className="mt-6 w-full rounded-full">
              <Link to={p.to}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-pink/20 text-brand-pink">
          <Store className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">Marketplace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse every Blue Finance product — business, salary, agricultural, SME, order finance
            and advisory services.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full sm:w-auto">
          <Link to="/finance/marketplace">Open Marketplace</Link>
        </Button>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Applications</h2>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/finance/applications">View all</Link>
          </Button>
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Track loan applications</p>
              <p className="text-xs text-muted-foreground">Submit an education finance application to see it here.</p>
            </div>
            <Button asChild size="sm" className="ml-auto rounded-full">
              <Link to={isOrganization ? "/finance/school" : "/finance/apply"}>Apply</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
