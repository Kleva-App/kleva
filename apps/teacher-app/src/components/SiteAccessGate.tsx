import { SiteAccessGate as SharedSiteAccessGate } from "@nudle/ui/site-gate";
import { api } from "@/lib/api";
import klevaMark from "@/assets/kleva-mark.svg";

async function checkAccess() {
  try {
    await api.get("/api/site-access");
    return true;
  } catch {
    return false;
  }
}

async function unlock(password: string) {
  await api.post("/api/site-access", { password });
}

export function SiteAccessGate({ children }: { children: React.ReactNode }) {
  return (
    <SharedSiteAccessGate
      checkAccess={checkAccess}
      unlock={unlock}
      markSrc={klevaMark}
      productLabel="Kleva Educators"
    >
      {children}
    </SharedSiteAccessGate>
  );
}
