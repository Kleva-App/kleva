import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getActiveChildId, setActiveChildId } from "@/lib/parent-account";
import { useMe, type LinkedChild } from "@/hooks/use-me";

type FamilyContextType = {
  isParent: boolean;
  isInstitution: boolean;
  canFinance: boolean;
  loading: boolean;
  children: LinkedChild[];
  activeChild: LinkedChild | null;
  setActiveChild: (id: string) => void;
  removeChild: (linkId: string) => Promise<void>;
};

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isParent, isInstitution, canFinance, children: linked, isPending, isFetching } = useMe();
  const [activeId, setActiveId] = useState<string | null>(() => getActiveChildId());

  const activeChild = useMemo(() => {
    if (!linked.length) return null;
    return linked.find((child) => child.id === activeId) ?? linked[0];
  }, [linked, activeId]);

  useEffect(() => {
    if (activeChild) setActiveChildId(activeChild.id);
  }, [activeChild]);

  const setActiveChild = (id: string) => {
    setActiveId(id);
    setActiveChildId(id);
  };

  const removeChild = async (linkId: string) => {
    await api.delete(`/api/parent/children/${linkId}`);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  return (
    <FamilyContext.Provider
      value={{
        isParent,
        isInstitution,
        canFinance,
        loading: Boolean(user) && (isPending || (isFetching && !data)),
        children: linked,
        activeChild,
        setActiveChild,
        removeChild,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
}
