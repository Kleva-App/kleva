import { Link } from "react-router-dom";
import { Building2, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SchoolAccountCard } from "@/components/finance/SchoolAccountCard";
import { SchoolStep } from "@/components/finance/SchoolStep";
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
import { wait } from "@/lib/parent-account";
import { api } from "@/lib/api";
import { schoolLevelLabel, type SelectedSchool } from "@/lib/zimbabwe-schools";
import { useToast } from "@nudle/ui/use-toast";

const PURPOSES = [
  "School fees bridging",
  "Working capital",
  "Infrastructure development",
  "Equipment & resources",
];

export default function FinanceSchool() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [school, setSchool] = useState<SelectedSchool | null>(null);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+263 ");
  const [purpose, setPurpose] = useState(PURPOSES[0]!);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const complete = Boolean(school && contactName.trim() && email.trim() && purpose && amount);

  async function submit() {
    if (!school) return;
    setBusy(true);
    try {
      await wait(400);
      await api.post("/api/finance/applications", {
        product: "Organization Finance",
        amount: amount || "0",
        school,
        form: {
          purpose,
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["finance-applications"] });
      setSubmitted(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not submit application",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Application submitted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your organization finance request has been sent to Blue Finance. A relationship manager will be
          in touch within two business days.
        </p>
        <Button asChild className="mt-8 rounded-full px-6">
          <Link to="/finance/applications">View my applications</Link>
        </Button>
      </div>
    );
  }

  if (!school) {
    return <SchoolStep onDone={setSchool} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Organization Finance</h1>
      <p className="page-subtitle mt-1">
        Working capital, fee bridging, infrastructure and equipment for your organization.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{school.name}</span>
          <span className="text-xs text-muted-foreground">
            {schoolLevelLabel(school.level)}
            {school.district ? ` · ${school.district}` : ""}
            {school.province ? `, ${school.province}` : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full text-xs"
            onClick={() => setSchool(null)}
          >
            Change school
          </Button>
        </div>
        <p className="mt-2 pl-7 text-xs text-muted-foreground">
          {school.bank} · {school.accountNumber}
        </p>
      </div>

      <div className="mt-4">
        <SchoolAccountCard school={school} />
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="contactName">Contact person</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Head, bursar or finance officer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.ac.zw"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Funding for</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger id="purpose">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Requested amount (USD)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/finance/home">Cancel</Link>
          </Button>
          <Button className="rounded-full px-6" disabled={!complete || busy} onClick={() => void submit()}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
