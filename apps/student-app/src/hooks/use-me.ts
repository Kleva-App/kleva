import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export type School = {
  id: string;
  name: string;
  shortName: string;
};

export type LinkedChild = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  relationship: string;
  linkId: string;
  school: School | null;
};

export type MeResponse = {
  id: string;
  email: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  roles: string[];
  preferences: { theme: "light" | "dark" | "system" };
  children: LinkedChild[];
  parentProfile: { phone: string | null; nationalId: string | null } | null;
  school: School | null;
};

export function useMe() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => api.get<MeResponse>("/api/me"),
    enabled: Boolean(user),
  });

  const roles = query.data?.roles ?? [];
  const isParent = roles.includes("parent");
  const isOrganization =
    roles.includes("organization") || roles.includes("institution");
  const canFinance = isParent || isOrganization;

  return {
    ...query,
    isParent,
    isOrganization,
    canFinance,
    roles,
    children: query.data?.children ?? [],
  };
}
