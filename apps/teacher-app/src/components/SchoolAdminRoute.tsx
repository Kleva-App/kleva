import { Navigate } from "react-router-dom";
import { useMe } from "@/hooks/useTeacherData";

export function SchoolAdminRoute({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  if (!me?.roles?.includes("school_admin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
