import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useMe } from "@/hooks/useTeacherData";

export type AdminSchool = {
  id: string;
  name: string;
  shortName: string;
};

type SchoolContextValue = {
  schools: AdminSchool[];
  activeSchoolId: string | null;
  activeSchool: AdminSchool | null;
  setActiveSchoolId: (id: string) => void;
  isLoading: boolean;
  refreshSchools: () => void;
};

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

const STORAGE_KEY = "kleva.activeSchoolId";

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;
  const [activeSchoolId, setActiveSchoolIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const schoolsQuery = useQuery({
    queryKey: ["school-admin-schools"],
    queryFn: () => api.get<AdminSchool[]>("/api/school-admin/schools"),
    enabled: isSchoolAdmin,
  });

  const schools = schoolsQuery.data ?? [];

  useEffect(() => {
    if (!isSchoolAdmin || schools.length === 0) return;
    const stillValid = activeSchoolId && schools.some((s) => s.id === activeSchoolId);
    if (!stillValid) {
      setActiveSchoolIdState(schools[0]!.id);
    }
  }, [isSchoolAdmin, schools, activeSchoolId]);

  useEffect(() => {
    if (!activeSchoolId) return;
    try {
      localStorage.setItem(STORAGE_KEY, activeSchoolId);
    } catch {
      // ignore
    }
  }, [activeSchoolId]);

  const value = useMemo<SchoolContextValue>(
    () => ({
      schools,
      activeSchoolId: isSchoolAdmin ? activeSchoolId : null,
      activeSchool: schools.find((s) => s.id === activeSchoolId) ?? null,
      setActiveSchoolId: setActiveSchoolIdState,
      isLoading: isSchoolAdmin && schoolsQuery.isLoading,
      refreshSchools: () => {
        void schoolsQuery.refetch();
      },
    }),
    [schools, activeSchoolId, isSchoolAdmin, schoolsQuery],
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error("useSchool must be used within SchoolProvider");
  }
  return ctx;
}
