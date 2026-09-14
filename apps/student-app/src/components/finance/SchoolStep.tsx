import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SchoolAccountCard } from "@/components/finance/SchoolAccountCard";
import { SchoolPicker } from "@/components/finance/SchoolPicker";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nudle/ui/select";
import {
  dummyBankDetails,
  loadZimbabweSchools,
  ZIMBABWE_SCHOOL_PROVINCES,
  type SelectedSchool,
  type ZimbabweSchool,
} from "@/lib/zimbabwe-schools";
import { cn } from "@/lib/utils";

const customFields: Array<[string, string, string]> = [
  ["name", "School name", "text"],
  ["district", "District / suburb", "text"],
];

export function SchoolStep({ onDone }: { onDone: (school: SelectedSchool) => void }) {
  const [schools, setSchools] = useState<ZimbabweSchool[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [choice, setChoice] = useState("");
  const [notListed, setNotListed] = useState(false);
  const [custom, setCustom] = useState<Record<string, string>>({
    name: "",
    district: "",
    province: "",
    level: "primary",
  });

  useEffect(() => {
    let cancelled = false;
    loadZimbabweSchools()
      .then((list) => {
        if (!cancelled) setSchools(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load schools");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = schools?.find((s) => s.id === choice) ?? null;
  const customComplete = Boolean(custom.name?.trim() && custom.province && custom.level);
  const customBank = useMemo(() => {
    const name = custom.name.trim();
    if (!name) return null;
    return dummyBankDetails(`${name}|${custom.province}|${custom.district}`, name, custom.district);
  }, [custom.name, custom.province, custom.district]);

  function selectListed() {
    if (!selected) return;
    onDone({
      id: selected.id,
      name: selected.name,
      level: selected.level,
      province: selected.province,
      district: selected.district,
      bank: selected.bank,
      branch: selected.branch,
      accountName: selected.accountName,
      accountNumber: selected.accountNumber,
    });
  }

  function selectCustom() {
    if (!customBank) return;
    onDone({
      id: null,
      name: custom.name.trim(),
      level: custom.level === "secondary" ? "secondary" : "primary",
      province: custom.province,
      district: custom.district.trim(),
      ...customBank,
    });
  }

  const preview = notListed ? customBank : selected;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Choose the school</h1>
      <p className="page-subtitle mt-1">
        Select the Zimbabwe primary or high school this loan is for. Fees are paid directly into
        that school&apos;s account.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {schools ? (
          <p className="mb-5 text-xs text-muted-foreground">
            {schools.length.toLocaleString()} primary and high schools in this demo.
          </p>
        ) : loadError ? (
          <p className="mb-5 text-sm text-destructive">{loadError}</p>
        ) : (
          <p className="mb-5 text-sm text-muted-foreground">Loading schools…</p>
        )}

        {schools && (
          <SchoolPicker
            schools={schools}
            selectedId={choice}
            onSelect={(school) => {
              setChoice(school.id);
              setNotListed(false);
            }}
          />
        )}

        <button
          type="button"
          onClick={() => {
            setNotListed((v) => !v);
            setChoice("");
          }}
          className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          My school is not on the list
        </button>

        {notListed && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Add school details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Use this if the school is new or missing from the register. A demo account will be
                assigned.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {customFields.map(([k, label, type]) => (
                <div key={k} className={cn("space-y-2", k === "name" && "sm:col-span-2")}>
                  <Label htmlFor={`school-${k}`}>{label}</Label>
                  <Input
                    id={`school-${k}`}
                    type={type}
                    value={custom[k] ?? ""}
                    onChange={(e) => setCustom((d) => ({ ...d, [k]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="custom-level">School type</Label>
                <Select
                  value={custom.level}
                  onValueChange={(v) => setCustom((d) => ({ ...d, level: v }))}
                >
                  <SelectTrigger id="custom-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">High school</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-province">Province</Label>
                <Select
                  value={custom.province}
                  onValueChange={(v) => setCustom((d) => ({ ...d, province: v }))}
                >
                  <SelectTrigger id="custom-province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZIMBABWE_SCHOOL_PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="mt-6">
            <SchoolAccountCard school={preview} />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/finance/home">Cancel</Link>
          </Button>
          <Button
            className="rounded-full px-6"
            disabled={notListed ? !customComplete : !selected}
            onClick={() => (notListed ? selectCustom() : selectListed())}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
