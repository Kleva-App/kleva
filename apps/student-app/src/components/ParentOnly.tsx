import { Navigate } from "react-router-dom";
import { useFamily } from "@/contexts/FamilyContext";
import { useMe } from "@/hooks/use-me";

export function ParentOnly({ children }: { children: React.ReactNode }) {
  const { isParent, isPending, isFetched } = useMe();

  if (isPending || !isFetched) {
    return <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isParent) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function FinanceAccess({ children }: { children: React.ReactNode }) {
  const { canFinance, isPending, isFetched } = useMe();

  if (isPending || !isFetched) {
    return <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!canFinance) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/** School pages are hidden for organizations and parents until a student is linked. */
export function useSchoolPortalHidden() {
  const { isParent, isOrganization, children: linked, loading } = useFamily();
  return {
    loading,
    hidden: (isParent || isOrganization) && linked.length === 0,
  };
}

/** School portal pages — hidden from parents/organizations until they have a linked student. */
export function RequiresLinkedStudent({ children }: { children: React.ReactNode }) {
  const { hidden, loading } = useSchoolPortalHidden();

  if (loading) {
    return <>{children}</>;
  }

  if (hidden) {
    return <Navigate to="/finance/home" replace />;
  }

  return <>{children}</>;
}
