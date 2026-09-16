import { Link } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Landmark,
  Lightbulb,
  Sprout,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@nudle/ui/button";

const products = [
  {
    icon: Briefcase,
    title: "Individual Business Loans",
    desc: "Working capital and growth funding for individual entrepreneurs.",
    tag: "From 12 months",
    to: "/finance/apply",
    cta: "Apply now",
  },
  {
    icon: GraduationCap,
    title: "Educational Loans",
    desc: "Spread school fees and education costs over affordable instalments.",
    tag: "Most popular",
    to: "/finance/apply",
    cta: "Apply now",
  },
  {
    icon: Landmark,
    title: "Salary Based Loans",
    desc: "Fast credit for salaried employees, repaid straight from payroll.",
    tag: "Quick approval",
    to: "/finance/apply",
    cta: "Apply now",
  },
  {
    icon: Sprout,
    title: "Agricultural Loans",
    desc: "Seasonal input, equipment and livestock finance for farmers.",
    tag: "Seasonal terms",
    to: "/finance/apply",
    cta: "Apply now",
  },
  {
    icon: Store,
    title: "SME and Microfinance Loans",
    desc: "Flexible facilities for small businesses and microenterprises.",
    tag: "Tailored limits",
    to: "/finance/school",
    cta: "Learn more",
  },
  {
    icon: Truck,
    title: "Order Finance",
    desc: "Funding for suppliers fulfilling confirmed school and organization orders.",
    tag: "Purchase order backed",
    to: "/finance/supplier",
    cta: "Learn more",
  },
  {
    icon: Lightbulb,
    title: "Advisory Services",
    desc: "Financial planning, structuring and business advisory from Blue Finance.",
    tag: "Free consultation",
    to: "/finance/home",
    cta: "Request a call",
  },
];

export default function FinanceMarketplace() {
  return (
    <div>
      <h1 className="page-title">Marketplace</h1>
      <p className="page-subtitle mt-1">
        Every Blue Finance product available to Kleva families, organizations and suppliers.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.title}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive">
                {p.tag}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
            <Button asChild className="mt-6 w-full rounded-full">
              <Link to={p.to}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
