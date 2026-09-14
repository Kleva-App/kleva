import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireParent, type AuthenticatedRequest } from "../middleware/auth.js";
import { db } from "../lib/db.js";

export const financeRouter = Router();

financeRouter.use("/finance", requireAuth, requireParent);

function publicRef(prefix: string) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

function mapApplication(row: {
  id: string;
  public_ref: string;
  product: string;
  facility: string;
  amount: string;
  status: string;
  school_id: string | null;
  school_name: string | null;
  school_level: string | null;
  school_province: string | null;
  school_district: string | null;
  school_bank: string | null;
  school_account_name: string | null;
  school_account_number: string | null;
  employer_name: string | null;
  employer_sector: string | null;
  employer_pending: boolean;
  form: unknown;
  note: string;
  instalments_paid: number;
  instalments_total: number | null;
  student_id: string | null;
  created_at: Date | string;
}) {
  const paid = Number(row.instalments_paid) || 0;
  const total = row.instalments_total == null ? null : Number(row.instalments_total);
  return {
    id: row.id,
    publicRef: row.public_ref,
    product: row.product,
    facility: row.facility,
    amount: row.amount,
    status: row.status,
    school: row.school_name
      ? {
          id: row.school_id,
          name: row.school_name,
          level: row.school_level ?? "",
          province: row.school_province ?? "",
          district: row.school_district ?? "",
          bank: row.school_bank ?? "",
          accountName: row.school_account_name ?? "",
          accountNumber: row.school_account_number ?? "",
        }
      : null,
    employer: row.employer_name
      ? {
          name: row.employer_name,
          sector: row.employer_sector ?? "",
          pending: Boolean(row.employer_pending),
        }
      : null,
    form: row.form ?? {},
    note: row.note,
    studentId: row.student_id,
    submitted: row.created_at,
    progress:
      total && total > 0
        ? { paid, total }
        : undefined,
  };
}

financeRouter.get("/finance/applications", async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await db("finance_applications")
      .where({ parent_id: req.user!.id })
      .orderBy("created_at", "desc");
    res.json(rows.map(mapApplication));
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load applications",
    });
  }
});

const createApplicationSchema = z.object({
  studentId: z.string().min(1).optional(),
  product: z.string().min(1).default("Education Finance"),
  facility: z.string().min(1).optional(),
  amount: z.string().min(1).default("0"),
  school: z.object({
    id: z.string().min(1).nullable().optional(),
    name: z.string().min(1),
    level: z.enum(["primary", "secondary"]),
    province: z.string().optional(),
    district: z.string().optional(),
    bank: z.string().optional(),
    branch: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
  }),
  employer: z
    .object({
      name: z.string().min(1),
      sector: z.string().optional(),
      pending: z.boolean().optional(),
    })
    .optional(),
  form: z.record(z.string(), z.string()).default({}),
  hasIdFront: z.boolean().optional(),
  hasIdBack: z.boolean().optional(),
  hasSignature: z.boolean().optional(),
});

financeRouter.post("/finance/applications", async (req: AuthenticatedRequest, res) => {
  try {
    const body = createApplicationSchema.parse(req.body);
    const parentId = req.user!.id;

    if (body.studentId) {
      const linked = await db("parent_students")
        .where({ parent_id: parentId, student_id: body.studentId })
        .first();
      if (!linked) {
        res.status(400).json({ error: "Student is not linked to this parent" });
        return;
      }
    }

    const purpose = body.form.purpose?.trim();
    const tenure = body.form.tenure?.trim();
    const facility =
      body.facility ||
      [purpose, tenure].filter(Boolean).join(" — ") ||
      "Education finance";

    const employerName = body.employer?.name;
    const note = applicationNote(
      body.school.name,
      body.school.bank,
      body.school.accountNumber,
      employerName,
      Boolean(body.employer?.pending),
    );

    const instalmentsTotal = tenureMonths(body.form.tenure);

    const [row] = await db("finance_applications")
      .insert({
        public_ref: publicRef("BF-EDU"),
        parent_id: parentId,
        student_id: body.studentId ?? null,
        product: body.product,
        facility,
        amount: body.amount.replace(/^\$/, ""),
        status: "Under Review",
        school_id: body.school.id ?? null,
        school_name: body.school.name,
        school_level: body.school.level,
        school_province: body.school.province ?? "",
        school_district: body.school.district ?? "",
        school_bank: body.school.bank ?? null,
        school_account_name: body.school.accountName ?? null,
        school_account_number: body.school.accountNumber ?? null,
        employer_name: body.employer?.name ?? null,
        employer_sector: body.employer?.sector ?? null,
        employer_pending: Boolean(body.employer?.pending),
        form: body.form,
        has_id_front: Boolean(body.hasIdFront),
        has_id_back: Boolean(body.hasIdBack),
        has_signature: Boolean(body.hasSignature),
        note,
        instalments_paid: 0,
        instalments_total: instalmentsTotal,
      })
      .returning("*");

    res.status(201).json(mapApplication(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to submit application",
    });
  }
});

function applicationNote(
  schoolName: string,
  bank: string | undefined,
  accountNumber: string | undefined,
  employerName: string | undefined,
  pending: boolean,
) {
  const dest =
    bank && accountNumber
      ? `Loan for ${schoolName}, paid to ${bank} ${accountNumber}.`
      : `Loan for ${schoolName}.`;
  if (pending && employerName) {
    return `Documents received. ${dest} ${employerName} is awaiting employer accreditation.`;
  }
  if (employerName) {
    return `Documents received. ${dest} Awaiting employer confirmation from ${employerName}.`;
  }
  return `Documents received. ${dest} Your application is with Blue Finance for review.`;
}

function tenureMonths(tenure: string | undefined) {
  if (!tenure) return null;
  const match = tenure.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

const createPaymentSchema = z.object({
  studentId: z.string().min(1).optional(),
  status: z.enum(["success", "pending", "failed"]),
  amount: z.number().nonnegative(),
  fee: z.number().nonnegative().default(0),
  method: z.string().min(1),
  school: z.string().min(1),
  account: z.string().optional(),
  purpose: z.string().optional(),
  prefix: z.enum(["KLV", "KLU"]).optional(),
});

financeRouter.post("/finance/payments", async (req: AuthenticatedRequest, res) => {
  try {
    const body = createPaymentSchema.parse(req.body);
    const prefix = body.prefix ?? "KLV";
    const public_ref = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (body.studentId) {
      const linked = await db("parent_students")
        .where({ parent_id: req.user!.id, student_id: body.studentId })
        .first();
      if (!linked) {
        res.status(400).json({ error: "Student is not linked to this parent" });
        return;
      }
    }

    const [row] = await db("finance_payments")
      .insert({
        public_ref,
        parent_id: req.user!.id,
        student_id: body.studentId ?? null,
        status: body.status,
        amount: body.amount,
        fee: body.fee,
        method: body.method,
        school: body.school,
        account: body.account ?? "",
        purpose: body.purpose ?? "",
      })
      .returning("*");

    res.status(201).json(mapPayment(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to record payment",
    });
  }
});

financeRouter.get("/finance/payments/:ref", async (req: AuthenticatedRequest, res) => {
  try {
    const row = await db("finance_payments")
      .where({ public_ref: req.params.ref, parent_id: req.user!.id })
      .first();

    if (!row) {
      res.status(404).json({ error: "Receipt not found" });
      return;
    }

    res.json(mapPayment(row));
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load receipt",
    });
  }
});

function mapPayment(row: {
  public_ref: string;
  status: string;
  amount: string | number;
  fee: string | number;
  method: string;
  school: string;
  account: string;
  purpose: string;
  created_at: Date | string;
}) {
  return {
    ref: row.public_ref,
    status: row.status,
    amount: Number(row.amount),
    fee: Number(row.fee),
    method: row.method,
    school: row.school,
    account: row.account,
    purpose: row.purpose,
    date: row.created_at,
  };
}
