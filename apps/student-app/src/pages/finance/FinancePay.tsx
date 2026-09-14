import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  GraduationCap,
  Landmark,
  Loader2,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Label } from "@nudle/ui/label";
import { SchoolAccountCard } from "@/components/finance/SchoolAccountCard";
import { SchoolPicker } from "@/components/finance/SchoolPicker";
import { wait } from "@/lib/parent-account";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@nudle/ui/use-toast";
import { formatSchoolAccount, loadZimbabweSchools, type ZimbabweSchool } from "@/lib/zimbabwe-schools";

const methods = [
  {
    id: "card",
    icon: CreditCard,
    title: "Debit / Credit card",
    desc: "Visa, Mastercard — instant confirmation",
    fee: 1.5,
  },
  {
    id: "bank",
    icon: Landmark,
    title: "Bank transfer",
    desc: "Direct transfer to the school account",
    fee: 0,
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile money",
    desc: "EcoCash, OneMoney and partner wallets",
    fee: 1,
  },
  {
    id: "zikimall",
    icon: ShoppingBag,
    title: "Zikimall",
    desc: "Pay securely via zikimall.com",
    fee: 0,
  },
] as const;

type MethodId = (typeof methods)[number]["id"];

type PaymentRecord = {
  ref: string;
  status: string;
  amount: number;
  fee: number;
  method: string;
  school: string;
  account: string;
  purpose: string;
  date: string;
};

export default function FinancePay() {
  const [schools, setSchools] = useState<ZimbabweSchool[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [term, setTerm] = useState("Term 3 · 2026 tuition");
  const [amount, setAmount] = useState("450");
  const [method, setMethod] = useState<MethodId>("card");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeChild } = useFamily();

  useEffect(() => {
    let cancelled = false;
    loadZimbabweSchools()
      .then((list) => {
        if (!cancelled) setSchools(list);
      })
      .catch((err) => {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Could not load schools",
            description: err instanceof Error ? err.message : "Please try again",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const school = schools.find((s) => s.id === schoolId) ?? null;
  const selected = methods.find((m) => m.id === method)!;
  const value = Number(amount) || 0;
  const fee = Math.round(value * (selected.fee / 100) * 100) / 100;
  const total = Math.round((value + fee) * 100) / 100;

  const set = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const canPay =
    Boolean(school) &&
    value > 0 &&
    (method === "card"
      ? (fields.cardNumber ?? "").length >= 12 &&
        !!fields.expiry &&
        (fields.cvc ?? "").length >= 3
      : method === "mobile"
        ? (fields.msisdn ?? "").length >= 9
        : true);

  async function pay() {
    if (!school) return;
    setBusy(true);
    if (method === "zikimall") {
      window.open("https://zikimall.com/", "_blank", "noopener,noreferrer");
    }
    await wait();

    const digits = (fields.cardNumber ?? "").replace(/\D/g, "");
    const status: "success" | "pending" | "failed" =
      method === "card" && digits.endsWith("0000")
        ? "failed"
        : method === "bank"
          ? "pending"
          : "success";

    try {
      const receipt = await api.post<PaymentRecord>("/api/finance/payments", {
        studentId: activeChild?.id,
        status,
        amount: value,
        fee,
        method: selected.title,
        school: school.name,
        account: formatSchoolAccount(school),
        purpose: term || "—",
        prefix: "KLV",
      });
      const params = new URLSearchParams({
        ref: receipt.ref,
        status: receipt.status,
        amount: String(receipt.amount),
        fee: String(receipt.fee),
        method: receipt.method,
        school: receipt.school,
        account: receipt.account,
        purpose: receipt.purpose,
        date: String(receipt.date),
      });
      navigate(`/finance/receipt?${params.toString()}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Payment could not be recorded",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Pay school fees</h1>
      <p className="page-subtitle mt-1">
        Funds are paid directly into the school account. Secured by Blue Finance.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              <Sparkles className="h-3 w-3" />
              Can&apos;t pay in full?
            </span>
            <h2 className="mt-2 text-lg font-semibold">Apply for an Education Loan</h2>
            <p className="mt-1 text-sm text-white/85">
              Spread school fees over affordable monthly instalments with Blue Finance. Quick online
              application, no paperwork.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-full bg-brand-orange px-5 text-white shadow-sm hover:bg-brand-orange/90"
          >
            <Link to="/finance/apply">
              Apply now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">School account</h2>
            {schools.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading schools…</p>
            ) : (
              <div className="mt-4">
                <SchoolPicker
                  schools={schools}
                  selectedId={schoolId}
                  onSelect={(s) => setSchoolId(s.id)}
                />
              </div>
            )}
            {school && (
              <div className="mt-4">
                <SchoolAccountCard school={school} />
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Payment for</Label>
                <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    m.id === method
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <m.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">{m.desc}</span>
                    <span className="mt-1 block text-xs font-medium text-primary">
                      {m.fee ? `${m.fee}% processing fee` : "No processing fee"}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {method === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card number</Label>
                    <Input
                      id="cardNumber"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      value={fields.cardNumber ?? ""}
                      onChange={(e) => set("cardNumber", e.target.value.replace(/[^\d ]/g, ""))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on card</Label>
                      <Input
                        id="cardName"
                        value={fields.cardName ?? ""}
                        onChange={(e) => set("cardName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={fields.expiry ?? ""}
                        onChange={(e) => set("expiry", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        inputMode="numeric"
                        maxLength={4}
                        value={fields.cvc ?? ""}
                        onChange={(e) => set("cvc", e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>
                </>
              )}

              {method === "mobile" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="msisdn">Mobile money number</Label>
                    <Input
                      id="msisdn"
                      inputMode="tel"
                      placeholder="0771 234 567"
                      value={fields.msisdn ?? ""}
                      onChange={(e) => set("msisdn", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet</Label>
                    <Input
                      id="wallet"
                      placeholder="EcoCash"
                      value={fields.wallet ?? ""}
                      onChange={(e) => set("wallet", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {method === "bank" && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  {school ? (
                    <>
                      Transfer to {school.bank} account {school.accountNumber} for {school.name}.
                      Use reference <span className="font-medium text-foreground">{term}</span>.
                      We&apos;ll confirm the payment once the transfer clears.
                    </>
                  ) : (
                    <>Select a school to see the account to transfer to.</>
                  )}
                </div>
              )}

              {method === "zikimall" && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  You will be redirected to{" "}
                  <a
                    href="https://zikimall.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    zikimall.com
                  </a>{" "}
                  to complete the payment. Return here to confirm the transaction.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="School" value={school?.name ?? "—"} />
            <Row label="Account" value={school ? formatSchoolAccount(school) : "—"} />
            <Row label="Purpose" value={term || "—"} />
            <Row label="Amount" value={`$${value.toFixed(2)}`} />
            <Row label="Processing fee" value={`$${fee.toFixed(2)}`} />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
          </div>
          <Button
            className="mt-6 w-full rounded-full"
            disabled={!canPay || busy}
            onClick={() => void pay()}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {busy ? "Processing…" : `Pay $${total.toFixed(2)}`}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/finance/home">Cancel</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
