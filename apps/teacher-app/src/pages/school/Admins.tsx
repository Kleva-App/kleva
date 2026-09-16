import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import { useToast } from "@nudle/ui/use-toast";
import { api } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import { DataTable, PageHeader } from "./shared";

type AdminRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function AdminsPage() {
  const { schools, activeSchoolId, activeSchool } = useSchool();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const schoolId = activeSchoolId;

  const adminsQuery = useQuery({
    queryKey: ["school-admin-admins", schoolId],
    queryFn: () =>
      api.get<AdminRow[]>(`/api/school-admin/admins?schoolId=${encodeURIComponent(schoolId!)}`),
    enabled: Boolean(schoolId),
  });

  const createAdmin = useMutation({
    mutationFn: () =>
      api.post("/api/school-admin/admins", {
        name,
        email,
        password,
        schoolId,
      }),
    onSuccess: () => {
      setName("");
      setEmail("");
      setPassword("");
      void qc.invalidateQueries({ queryKey: ["school-admin-admins", schoolId] });
      toast({ title: "Admin created", description: "They can sign in to the educator app." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not create admin", description: err.message, variant: "destructive" });
    },
  });

  if (schools.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Admins"
          subtitle="Create a school first, then invite other school admins."
        />
        <div className="surface-card p-8 text-sm text-muted-foreground">
          No schools yet. Go to Schools and create one.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Admins"
        subtitle={
          activeSchool
            ? `Manage school admins for ${activeSchool.name}.`
            : "Manage school admins for the selected school."
        }
      />

      <div className="surface-card p-6 space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold tracking-tight">Create admin</h2>
        <div className="space-y-2">
          <Label htmlFor="admin-name">Full name</Label>
          <Input
            id="admin-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Temporary password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="rounded-xl"
          />
        </div>
        <Button
          className="rounded-full"
          disabled={
            !schoolId ||
            !name.trim() ||
            !email.trim() ||
            password.length < 6 ||
            createAdmin.isPending
          }
          onClick={() => createAdmin.mutate()}
        >
          {createAdmin.isPending ? "Creating…" : "Create admin"}
        </Button>
      </div>

      <DataTable headers={["Name", "Email", "Added"]}>
        {(adminsQuery.data ?? []).length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
              {adminsQuery.isLoading ? "Loading…" : "No admins listed yet."}
            </td>
          </tr>
        ) : (
          (adminsQuery.data ?? []).map((row) => (
            <tr key={row.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 font-medium">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
