import { db } from "./db.js";

export type School = {
  id: string;
  name: string;
  shortName: string;
};

/** Seed defaults — also inserted by the schools migration. New schools live in DB only. */
export const SCHOOLS: School[] = [
  { id: "kleva-high", name: "Kleva High School", shortName: "KH" },
  { id: "kleva-primary", name: "Kleva Primary School", shortName: "KP" },
];

export const DEFAULT_SCHOOL_ID = SCHOOLS[0]!.id;

function rowToSchool(row: { id: string; name: string; short_name: string }): School {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
  };
}

export async function schoolById(id: string | null | undefined): Promise<School | null> {
  if (!id) return null;
  const row = await db("schools").where({ id }).first("id", "name", "short_name");
  return row ? rowToSchool(row) : null;
}

export async function listSchools(): Promise<School[]> {
  const rows = await db("schools").select("id", "name", "short_name").orderBy("name");
  return rows.map(rowToSchool);
}

export function schoolForUserId(userId: string): School {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % SCHOOLS.length;
  }
  return SCHOOLS[hash]!;
}

export function slugifySchoolId(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `school-${Date.now()}`;
}

export function shortNameFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
