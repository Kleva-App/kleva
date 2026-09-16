import klevaMark from "@/assets/kleva-mark.svg";
import { PageShell } from "@nudle/ui/page-shell";

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 py-6 mt-auto">
      <PageShell
        variant="bar"
        className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          <img src={klevaMark} alt="" className="h-5 w-5" />
          Kleva
        </span>
        <p>© {new Date().getFullYear()} Kleva. All rights reserved.</p>
      </PageShell>
    </footer>
  );
};
