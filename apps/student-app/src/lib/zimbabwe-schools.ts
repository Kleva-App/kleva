export type SchoolLevel = "primary" | "secondary";

export type SchoolBank = {
  bank: string;
  branch: string;
  accountName: string;
  accountNumber: string;
};

export type ZimbabweSchool = {
  id: string;
  name: string;
  level: SchoolLevel;
  province: string;
  district: string;
} & SchoolBank;

export type SelectedSchool = {
  id: string | null;
  name: string;
  level: SchoolLevel;
  province: string;
  district: string;
} & SchoolBank;

type ZimbabweSchoolsFile = {
  source: string;
  sourceUrl: string;
  year: number;
  schools: ZimbabweSchool[];
};

export const ZIMBABWE_SCHOOL_PROVINCES = [
  "Bulawayo",
  "Harare",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
] as const;

const BANKS = [
  { name: "CBZ Bank", code: "08" },
  { name: "Stanbic Bank", code: "11" },
  { name: "Standard Chartered", code: "04" },
  { name: "FBC Bank", code: "16" },
  { name: "NMB Bank", code: "13" },
  { name: "CABS", code: "61" },
  { name: "Steward Bank", code: "26" },
  { name: "ZB Bank", code: "01" },
  { name: "BancABC", code: "21" },
  { name: "Ecobank Zimbabwe", code: "23" },
] as const;

const RESULT_LIMIT = 80;

export function schoolLevelLabel(level: SchoolLevel) {
  return level === "primary" ? "Primary" : "High school";
}

export function schoolFeesAccountName(name: string) {
  const lower = name.toLowerCase();
  if (/(school|college|academy|high|convent)$/.test(lower)) return `${name} Fees`;
  return `${name} School Fees`;
}

export function dummyBankDetails(
  seed: string,
  schoolName: string,
  district = "",
): SchoolBank {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bank = BANKS[hash % BANKS.length]!;
  const raw = `${bank.code}${String(hash % 100_000_000).padStart(8, "0")}${String((hash * 7) % 100).padStart(2, "0")}`;
  return {
    bank: bank.name,
    branch: district || "Harare",
    accountName: schoolFeesAccountName(schoolName),
    accountNumber: `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8)}`,
  };
}

export function formatSchoolAccount(school: SchoolBank) {
  return `${school.bank} ${school.accountNumber}`;
}

export async function loadZimbabweSchools(): Promise<ZimbabweSchool[]> {
  const { default: url } = await import("@/data/zimbabwe-schools.json?url");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not load the Zimbabwe schools list");
  }
  const data = (await res.json()) as ZimbabweSchoolsFile;
  return data.schools;
}

export function searchSchools(
  schools: ZimbabweSchool[],
  query: string,
): { matches: ZimbabweSchool[]; total: number; needsQuery: boolean } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return { matches: [], total: schools.length, needsQuery: true };
  }

  const matches: ZimbabweSchool[] = [];
  let total = 0;

  for (const school of schools) {
    const haystack = `${school.name} ${school.district} ${school.province}`.toLowerCase();
    if (!haystack.includes(q)) continue;
    total += 1;
    if (matches.length < RESULT_LIMIT) matches.push(school);
  }

  return { matches, total, needsQuery: false };
}
