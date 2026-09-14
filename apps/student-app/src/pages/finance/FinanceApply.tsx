import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IdUpload, type UploadedFile } from "@/components/finance/IdUpload";
import { SignaturePad } from "@/components/finance/SignaturePad";
import { Button } from "@nudle/ui/button";
import { Checkbox } from "@nudle/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@nudle/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@nudle/ui/dialog";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nudle/ui/select";
import { SchoolAccountCard } from "@/components/finance/SchoolAccountCard";
import { SchoolStep } from "@/components/finance/SchoolStep";
import { EMPLOYERS } from "@/lib/employers";
import { schoolLevelLabel, type SelectedSchool } from "@/lib/zimbabwe-schools";
import { wait } from "@/lib/parent-account";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@nudle/ui/use-toast";

const steps = [
  "Personal & Employment",
  "Loan Details",
  "Terms & Acknowledgement",
  "Review & Submit",
];

type Form = Record<string, string>;

const personalFields: Array<[string, string, string]> = [
  ["fullName", "Full name", "text"],
  ["dob", "Date of birth", "date"],
  ["idNumber", "ID / passport number", "text"],
  ["phone", "Phone number", "tel"],
  ["email", "Email address", "email"],
  ["address", "Residential address", "text"],
  ["employment", "Employment status", "text"],
];

const loanFields: Array<[string, string, string]> = [
  ["purpose", "Purpose of finance", "text"],
  ["amount", "Requested amount (USD)", "number"],
  ["tenure", "Number of instalments", "number"],
  ["approved", "Approved amount (USD)", "number"],
  ["instalment", "Monthly instalments (USD)", "number"],
];

type SelectedEmployer = { name: string; sector: string; pending: boolean };

export default function FinanceApply() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeChild } = useFamily();
  const [school, setSchool] = useState<SelectedSchool | null>(null);
  const [employer, setEmployer] = useState<SelectedEmployer | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({});
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [idFront, setIdFront] = useState<UploadedFile | null>(null);
  const [idBack, setIdBack] = useState<UploadedFile | null>(null);
  const [docOpen, setDocOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setBusy(true);
    try {
      await wait(400);
      await api.post("/api/finance/applications", {
        studentId: activeChild?.id,
        product: "Education Finance",
        amount: form.amount || "0",
        school,
        employer,
        form,
        hasIdFront: Boolean(idFront),
        hasIdBack: Boolean(idBack),
        hasSignature: Boolean(signature),
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
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Application Submitted!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your application has been securely submitted to Blue Finance for review. You will be
          notified of the outcome via SMS and email.
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

  if (!employer) {
    return (
      <div>
        <div className="mx-auto max-w-2xl">
          <ChosenSchoolBar school={school} onChange={() => setSchool(null)} />
        </div>
        <div className="mt-4">
          <EmployerStep onDone={setEmployer} />
        </div>
      </div>
    );
  }

  const canContinue = step === 2 ? agreed && Boolean(signature) && Boolean(idFront) : true;

  return (
    <div>
      <h1 className="page-title">Education Finance</h1>
      <p className="page-subtitle mt-1">
        Step {step + 1} of 4 · {steps[step]}
      </p>

      <div className="mt-4 space-y-2">
        <ChosenSchoolBar school={school} onChange={() => setSchool(null)} />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{employer.name}</span>
          <span className="text-xs text-muted-foreground">{employer.sector}</span>
          {employer.pending && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              <Clock className="h-3 w-3" /> Awaiting employer approval
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full text-xs"
            onClick={() => setEmployer(null)}
          >
            Change employer
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
            <p
              className={cn(
                "mt-2 hidden text-xs sm:block",
                i <= step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {personalFields.map(([k, label, type]) => (
              <div key={k} className={cn("space-y-2", k === "address" && "sm:col-span-2")}>
                <Label htmlFor={k}>{label}</Label>
                <Input id={k} type={type} value={form[k] ?? ""} onChange={set(k)} />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {loanFields.map(([k, label, type]) =>
              k === "tenure" ? (
                <div key={k} className="space-y-2">
                  <Label htmlFor={k}>Number of instalments</Label>
                  <Select
                    value={form[k] ?? ""}
                    onValueChange={(v) => setForm((f) => ({ ...f, [k]: v }))}
                  >
                    <SelectTrigger id={k}>
                      <SelectValue placeholder="Choose instalments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2 months">2 months</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pay the loan back over 1, 2 or 3 monthly instalments.
                  </p>
                </div>
              ) : (
                <div key={k} className={cn("space-y-2", k === "purpose" && "sm:col-span-2")}>
                  <Label htmlFor={k}>{label}</Label>
                  <Input id={k} type={type} value={form[k] ?? ""} onChange={set(k)} />
                </div>
              ),
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setDocOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground">
                View Acknowledgement of Debt
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>

            <label className="flex items-start gap-3 text-sm text-foreground">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span>
                I have read, understood and agree to the Acknowledgement of Debt.
                <span className="text-destructive"> *</span>
              </span>
            </label>

            <div className="space-y-4 border-t border-border pt-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Digital ID upload</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a clear copy of your national ID or passport for verification.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <IdUpload label="ID / passport (front)" required file={idFront} onChange={setIdFront} />
                <IdUpload label="ID / passport (back)" file={idBack} onChange={setIdBack} />
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <SignaturePad value={signature} onChange={setSignature} />
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="space-y-3">
              <SchoolAccountCard school={school} />
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">School</p>
                <p className="mt-1 text-sm text-foreground">{school.name}</p>
                <p className="text-xs text-muted-foreground">
                  {schoolLevelLabel(school.level)}
                  {school.district ? ` · ${school.district}` : ""}
                  {school.province ? `, ${school.province}` : ""}
                </p>
              </div>
            <SummarySection title="Personal & Employment Details" fields={personalFields} form={form} />
            <SummarySection title="Loan Details" fields={loanFields} form={form} />
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground">
                Terms & Acknowledgement
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 text-sm text-muted-foreground">
                Acknowledgement of Debt {agreed ? "accepted" : "not accepted"}.
              </CollapsibleContent>
            </Collapsible>

            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">Signature &amp; identity</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {signature ? (
                  <img
                    src={signature}
                    alt="Your electronic signature"
                    className="h-16 w-40 rounded-lg border border-border bg-background object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No signature captured</span>
                )}
                <div className="text-xs text-muted-foreground">
                  <p>ID front: {idFront ? idFront.name : "not uploaded"}</p>
                  <p>ID back: {idBack ? idBack.name : "not uploaded"}</p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 pt-2 text-sm text-foreground">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                className="mt-0.5"
              />
              <span>I confirm that all information provided is true and correct.</span>
            </label>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" className="rounded-full" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/finance/home">Cancel</Link>
            </Button>
          )}

          {step < 3 ? (
            <Button
              className="rounded-full px-6"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="rounded-full px-6"
              disabled={!confirmed || !agreed || busy}
              onClick={() => void submit()}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          )}
        </div>
      </div>

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Acknowledgement of Debt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              1. Repayment obligations. The borrower acknowledges being truly and lawfully indebted
              to Blue Finance in the approved capital amount, repayable in consecutive monthly
              instalments on or before the agreed due date of each month until settled in full.
            </p>
            <p>
              2. Interest. Interest accrues on the outstanding balance at the agreed annual rate,
              calculated monthly in arrears. Amounts in arrears may attract default interest and
              reasonable collection costs.
            </p>
            <p>
              3. Application of funds. Advances are disbursed strictly toward eligible school fees
              and education expenses and may be paid directly to the institution.
            </p>
            <p>
              4. Default. Failure to pay any instalment when due renders the full outstanding balance
              immediately due and payable, without prejudice to any other remedy.
            </p>
            <p>
              5. Jurisdiction. This acknowledgement is governed by the laws of the borrower&apos;s
              country of residence, and the parties consent to the jurisdiction of the competent
              magistrate&apos;s court.
            </p>
            <p className="text-xs">Placeholder document for demonstration purposes only.</p>
          </div>
          <Button className="rounded-full" onClick={() => setDocOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummarySection({
  title,
  fields,
  form,
}: {
  title: string;
  fields: Array<[string, string, string]>;
  form: Form;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground">
        {title}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-4 py-3">
        {fields.map(([k, label]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-foreground">{form[k] || "—"}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

const newEmployerFields: Array<[string, string, string]> = [
  ["empName", "Employer / company name", "text"],
  ["empSector", "Industry / sector", "text"],
  ["empReg", "Company registration number", "text"],
  ["empAddress", "Physical address", "text"],
  ["empHr", "HR / payroll contact name", "text"],
  ["empEmail", "HR contact email", "email"],
  ["empPhone", "HR contact phone", "tel"],
  ["empStaffNo", "Your employee / staff number", "text"],
];

function ChosenSchoolBar({
  school,
  onChange,
}: {
  school: SelectedSchool;
  onChange: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">{school.name}</span>
        <span className="text-xs text-muted-foreground">
          {schoolLevelLabel(school.level)}
          {school.district ? ` · ${school.district}` : ""}
          {school.province ? `, ${school.province}` : ""}
        </span>
        <Button variant="ghost" size="sm" className="ml-auto rounded-full text-xs" onClick={onChange}>
          Change school
        </Button>
      </div>
      <p className="mt-2 pl-7 text-xs text-muted-foreground">
        {school.bank} · {school.accountNumber}
        {school.accountName ? ` · ${school.accountName}` : ""}
      </p>
    </div>
  );
}

function EmployerStep({ onDone }: { onDone: (e: SelectedEmployer) => void }) {
  const [choice, setChoice] = useState<string>("");
  const [notListed, setNotListed] = useState(false);
  const [data, setData] = useState<Form>({});
  const [busy, setBusy] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const complete = Boolean(data.empName && data.empSector && data.empEmail);

  async function requestApproval() {
    setBusy(true);
    await wait();
    setBusy(false);
    setPendingName(data.empName ?? "");
  }

  if (pendingName) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Clock className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Employer sent for approval</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {pendingName} has been submitted to Blue Finance for accreditation. Verification with the HR
          contact usually takes 1–2 business days. You can continue with your application in the
          meantime — final approval depends on the employer being accredited.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            className="rounded-full px-6"
            onClick={() =>
              onDone({
                name: pendingName,
                sector: data.empSector ?? "Pending verification",
                pending: true,
              })
            }
          >
            Continue application
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/finance/home">Back to Kleva Finance</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Confirm your employer</h1>
      <p className="page-subtitle mt-1">
        Blue Finance assesses affordability against accredited Zimbabwean employers. Select yours to
        begin your application.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="employer">Employer</Label>
          <Select
            value={choice}
            onValueChange={(v) => {
              setChoice(v);
              setNotListed(false);
            }}
          >
            <SelectTrigger id="employer" className="w-full">
              <SelectValue placeholder="Select your employer" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYERS.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => {
            setNotListed((v) => !v);
            setChoice("");
          }}
          className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          My employer is not on the list
        </button>

        {notListed && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Add employer details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                We will contact the HR/payroll contact to accredit your employer before your loan can
                be approved.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {newEmployerFields.map(([k, label, type]) => (
                <div key={k} className={cn("space-y-2", k === "empAddress" && "sm:col-span-2")}>
                  <Label htmlFor={k}>{label}</Label>
                  <Input id={k} type={type} value={data[k] ?? ""} onChange={set(k)} />
                </div>
              ))}
            </div>
            <Button
              className="rounded-full px-6"
              disabled={!complete || busy}
              onClick={() => void requestApproval()}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit employer for approval
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/finance/home">Cancel</Link>
          </Button>
          <Button
            className="rounded-full px-6"
            disabled={!choice}
            onClick={() => {
              const e = EMPLOYERS.find((x) => x.id === choice);
              if (e) onDone({ name: e.name, sector: e.sector, pending: false });
            }}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
