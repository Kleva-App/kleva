import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import { useToast } from "@nudle/ui/use-toast";
import { api } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import { DataTable, PageHeader } from "./shared";

export default function SchoolsPage() {
  const { schools, setActiveSchoolId, refreshSchools } = useSchool();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const createSchool = useMutation({
    mutationFn: () =>
      api.post<{ id: string; name: string; shortName: string }>("/api/school-admin/schools", {
        name,
        shortName: shortName || undefined,
      }),
    onSuccess: (school) => {
      setName("");
      setShortName("");
      void qc.invalidateQueries({ queryKey: ["school-admin-schools"] });
      refreshSchools();
      setActiveSchoolId(school.id);
      toast({ title: "School created", description: school.name });
    },
    onError: (err: Error) => {
      toast({ title: "Could not create school", description: err.message, variant: "destructive" });
    },
  });

  const renameSchool = useMutation({
    mutationFn: () =>
      api.patch(`/api/school-admin/schools/${editingId}`, { name: editName }),
    onSuccess: () => {
      setEditingId(null);
      setEditName("");
      void qc.invalidateQueries({ queryKey: ["school-admin-schools"] });
      refreshSchools();
      toast({ title: "School updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not update school", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Schools"
        subtitle="Create and manage schools you administer."
      />

      <div className="surface-card p-6 space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold tracking-tight">Create school</h2>
        <div className="space-y-2">
          <Label htmlFor="school-name">School name</Label>
          <Input
            id="school-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Riverside High School"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="short-name">Short name (optional)</Label>
          <Input
            id="short-name"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="e.g. RHS"
            maxLength={8}
            className="rounded-xl"
          />
        </div>
        <Button
          className="rounded-full"
          disabled={name.trim().length < 2 || createSchool.isPending}
          onClick={() => createSchool.mutate()}
        >
          {createSchool.isPending ? "Creating…" : "Create school"}
        </Button>
      </div>

      <DataTable headers={["Name", "Short", "ID", ""]}>
        {schools.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
              No schools yet. Create one above to get started.
            </td>
          </tr>
        ) : (
          schools.map((school) => (
            <tr key={school.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 font-medium">
                {editingId === school.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl h-9 max-w-xs"
                  />
                ) : (
                  school.name
                )}
              </td>
              <td className="px-4 py-3">{school.shortName}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{school.id}</td>
              <td className="px-4 py-3 text-right space-x-2">
                {editingId === school.id ? (
                  <>
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={editName.trim().length < 2 || renameSchool.isPending}
                      onClick={() => renameSchool.mutate()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEditingId(school.id);
                      setEditName(school.name);
                    }}
                  >
                    Rename
                  </Button>
                )}
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
