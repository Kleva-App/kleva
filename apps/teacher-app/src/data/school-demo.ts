export type StaffMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "On leave";
  gradingTimeliness: number;
  registersMarked: number;
  ownAttendance: number;
  classAverage: number;
  parentReplyHrs: number;
};

export type StudentAlert = {
  kind: string;
  detail: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  form: string;
  formBand: "Form 1" | "Form 2" | "Form 3" | "Form 4" | "Form 5" | "Form 6";
  attendance: number;
  average: number;
  balance: number;
  status: "On track" | "Requires attention";
  alerts: StudentAlert[];
};

export type Applicant = {
  id: string;
  name: string;
  form: string;
  guardian: string;
  submitted: string;
  stage: "Enquiry" | "Application" | "Assessment" | "Offer" | "Enrolled";
};

export type SchoolDemo = {
  schoolName: string;
  staffKpis: {
    onRoll: number;
    avgGradingTimeliness: number;
    registersMarked: number;
    belowGradingTarget: number;
  };
  staff: StaffMember[];
  students: StudentRecord[];
  admissionsKpis: {
    openPlaces: number;
    inPipeline: number;
    offersOut: number;
    enrolledThisCycle: number;
  };
  applicants: Applicant[];
  subjects: { name: string; average: number }[];
  curriculum: { name: string; progress: number }[];
  missingGrades: { subject: string; missing: number; status: "Chase now" | "In progress" }[];
  attendanceTrend: { month: string; rate: number }[];
  formAttendance: { form: string; rate: number }[];
  classAttendance: {
    name: string;
    teacher: string;
    students: number;
    rate: number;
  }[];
  studentAttendance: { name: string; rate: number }[];
  feesTabs: string[];
  recentPayments: {
    date: string;
    student: string;
    form: string;
    method: "Mobile Money" | "Bank" | "Cash";
    reference: string;
    receivedBy: string;
    amount: number;
  }[];
  accountingKpis: {
    income: number;
    expenses: number;
    net: number;
    awaiting: number;
  };
  ledger: {
    date: string;
    reference: string;
    account: string;
    type: "Income" | "Expense";
    approver: string;
    status: "Approved" | "Pending approval";
    amount: number;
  }[];
  payrollKpis: {
    gross: number;
    deductions: number;
    net: number;
    draft: number;
  };
  payrollPeriod: string;
  payroll: {
    name: string;
    role: string;
    gross: number;
    deductions: number;
    net: number;
    status: "Approved" | "Draft";
  }[];
  communicationKpis: {
    unread: number;
    safeguarding: number;
    avgReplyHrs: number;
    announcements: number;
  };
  conversations: {
    id: string;
    from: string;
    role: string;
    tags: string[];
    time: string;
    subject: string;
    preview: string;
    tab: "Staff" | "Parent → Headmaster" | "Announcements";
  }[];
  reports: { title: string; description: string; updated: string }[];
  intelligence: { title: string; body: string; severity: "info" | "warn" | "ok" }[];
};

function hashSeed(schoolId: string): number {
  let h = 0;
  for (let i = 0; i < schoolId.length; i += 1) {
    h = (h * 31 + schoolId.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

export function getSchoolDemo(schoolId: string | null | undefined): SchoolDemo {
  const id = schoolId || "demo-school";
  const seed = hashSeed(id);
  const schoolName =
    id === "kleva-high"
      ? "Kleva High School"
      : id === "kleva-primary"
        ? "Kleva Primary School"
        : "Chiremba High School";

  return {
    schoolName,
    staffKpis: {
      onRoll: 10,
      avgGradingTimeliness: 88,
      registersMarked: 94,
      belowGradingTarget: 2,
    },
    staff: [
      {
        id: "t1",
        name: "Tendai Moyo",
        role: "Senior Teacher · Mathematics",
        department: "Mathematics",
        status: "Active",
        gradingTimeliness: 96,
        registersMarked: 99,
        ownAttendance: 98,
        classAverage: 71,
        parentReplyHrs: 4,
      },
      {
        id: "t2",
        name: "Nyasha Chirwa",
        role: "Teacher · Sciences",
        department: "Sciences",
        status: "Active",
        gradingTimeliness: 82,
        registersMarked: 91,
        ownAttendance: 95,
        classAverage: 74,
        parentReplyHrs: 6,
      },
      {
        id: "t3",
        name: "Farai Dube",
        role: "Teacher · English",
        department: "English",
        status: "Active",
        gradingTimeliness: 68,
        registersMarked: 88,
        ownAttendance: 92,
        classAverage: 69,
        parentReplyHrs: 12,
      },
      {
        id: "t4",
        name: "Chipo Zulu",
        role: "Head of Department · Commercials",
        department: "Commercials",
        status: "Active",
        gradingTimeliness: 94,
        registersMarked: 97,
        ownAttendance: 99,
        classAverage: 78,
        parentReplyHrs: 3,
      },
      {
        id: "t5",
        name: "Kudzai Phiri",
        role: "Deputy Head",
        department: "Leadership",
        status: "Active",
        gradingTimeliness: 90,
        registersMarked: 100,
        ownAttendance: 97,
        classAverage: 76,
        parentReplyHrs: 5,
      },
    ],
    students: [
      {
        id: "s1",
        name: "Aisha Patel",
        form: "Form 1 Blue",
        formBand: "Form 1",
        attendance: 96,
        average: 84,
        balance: 0,
        status: "On track",
        alerts: [],
      },
      {
        id: "s2",
        name: "Blessing Mutasa",
        form: "Form 2 Green",
        formBand: "Form 2",
        attendance: 74,
        average: 61,
        balance: 600,
        status: "Requires attention",
        alerts: [
          { kind: "Attendance below 80%", detail: "Attendance is 74% this term." },
          { kind: "Grade drop over 10 points", detail: "Average fell from 74 to 61 (13 points)." },
          { kind: "Fees overdue past 30 days", detail: "$600 outstanding, 46 days overdue." },
        ],
      },
      {
        id: "s3",
        name: "Kwame Okonkwo",
        form: "Form 3 Red",
        formBand: "Form 3",
        attendance: 91,
        average: 77,
        balance: 120,
        status: "On track",
        alerts: [],
      },
      {
        id: "s4",
        name: "Lindiwe Ndlovu",
        form: "Form 4 Blue",
        formBand: "Form 4",
        attendance: 88,
        average: 81,
        balance: 0,
        status: "On track",
        alerts: [],
      },
      {
        id: "s5",
        name: "Ethan Brooks",
        form: "Form 1 Green",
        formBand: "Form 1",
        attendance: 72,
        average: 58,
        balance: 310,
        status: "Requires attention",
        alerts: [
          { kind: "Attendance below 80%", detail: "Attendance is 72% this term." },
          { kind: "Fees overdue past 30 days", detail: "$310 outstanding, 22 days overdue." },
        ],
      },
      {
        id: "s6",
        name: "Sofia Alvarez",
        form: "Form 4 Red",
        formBand: "Form 4",
        attendance: 98,
        average: 91,
        balance: 0,
        status: "On track",
        alerts: [],
      },
      {
        id: "s7",
        name: "Tariro Maseko",
        form: "Form 3 Blue",
        formBand: "Form 3",
        attendance: 85,
        average: 64,
        balance: 450,
        status: "Requires attention",
        alerts: [
          { kind: "Grade drop over 10 points", detail: "Average fell from 76 to 64 (12 points)." },
          { kind: "Fees overdue past 30 days", detail: "$450 outstanding, 31 days overdue." },
        ],
      },
      {
        id: "s8",
        name: "Nyasha Gumbo",
        form: "Form 2 Blue",
        formBand: "Form 2",
        attendance: 94,
        average: 86,
        balance: 0,
        status: "On track",
        alerts: [],
      },
    ],
    admissionsKpis: {
      openPlaces: 32,
      inPipeline: 7,
      offersOut: 1,
      enrolledThisCycle: 1 + (seed % 3),
    },
    applicants: [
      {
        id: "a1",
        name: "Tadiwa Chihota",
        form: "Form 1",
        guardian: "Linda Chihota",
        submitted: "2026-06-13",
        stage: "Enquiry",
      },
      {
        id: "a2",
        name: "Nyaradzo Bere",
        form: "Form 1",
        guardian: "Simon Bere",
        submitted: "2026-06-11",
        stage: "Application",
      },
      {
        id: "a3",
        name: "Shamiso Mutero",
        form: "Form 2",
        guardian: "Kuda Mutero",
        submitted: "2026-06-10",
        stage: "Application",
      },
      {
        id: "a4",
        name: "Tawananyasha Musa",
        form: "Form 2",
        guardian: "Eunice Musa",
        submitted: "2026-06-09",
        stage: "Assessment",
      },
      {
        id: "a5",
        name: "Leeroy Chidavaenzi",
        form: "Form 4",
        guardian: "Hazel Chidavaenzi",
        submitted: "2026-06-07",
        stage: "Assessment",
      },
      {
        id: "a6",
        name: "Rutendo Mabika",
        form: "Form 1",
        guardian: "Peter Mabika",
        submitted: "2026-06-05",
        stage: "Offer",
      },
      {
        id: "a7",
        name: "Junior Phiri",
        form: "Form 1",
        guardian: "Grace Phiri",
        submitted: "2026-05-28",
        stage: "Enrolled",
      },
    ],
    subjects: [
      { name: "Mathematics", average: 54 },
      { name: "English", average: 48 },
      { name: "Combined Science", average: 52 },
      { name: "History", average: 57 },
      { name: "Geography", average: 50 },
      { name: "Shona", average: 55 },
      { name: "Business Studies", average: 49 },
      { name: "Art & Design", average: 61 },
    ],
    curriculum: [
      { name: "Mathematics", progress: 72 },
      { name: "English", progress: 64 },
      { name: "Combined Science", progress: 78 },
      { name: "History", progress: 81 },
      { name: "Geography", progress: 0 },
    ],
    missingGrades: [
      { subject: "English", missing: 28, status: "Chase now" },
      { subject: "Art & Design", missing: 18, status: "Chase now" },
      { subject: "Mathematics", missing: 12, status: "In progress" },
      { subject: "Geography", missing: 9, status: "In progress" },
      { subject: "Combined Science", missing: 7, status: "In progress" },
    ],
    attendanceTrend: [
      { month: "Jan", rate: 91 },
      { month: "Feb", rate: 90 },
      { month: "Mar", rate: 92 },
      { month: "Apr", rate: 89 },
      { month: "May", rate: 93 },
      { month: "Jun", rate: 92 },
    ],
    formAttendance: [
      { form: "Form 1", rate: 93 },
      { form: "Form 2", rate: 91 },
      { form: "Form 3", rate: 90 },
      { form: "Form 4", rate: 94 },
    ],
    classAttendance: [
      { name: "Form 1 Blue", teacher: "Tendai Moyo", students: 32, rate: 94 },
      { name: "Form 1 Green", teacher: "Nyasha Chirwa", students: 30, rate: 91 },
      { name: "Form 1 Red", teacher: "Farai Dube", students: 28, rate: 88 },
    ],
    studentAttendance: [
      { name: "Aisha Patel", rate: 96 },
      { name: "Blessing Mutasa", rate: 74 },
      { name: "Tariro Maseko", rate: 91 },
      { name: "Ethan Brooks", rate: 72 },
      { name: "Sofia Alvarez", rate: 98 },
      { name: "Nyasha Gumbo", rate: 88 },
    ],
    feesTabs: ["Payments", "Fee schedules", "Arrears", "Audit trail"],
    recentPayments: [
      {
        date: "2026-06-14",
        student: "Aisha Patel",
        form: "Form 1",
        method: "Mobile Money",
        reference: "ECO-88213",
        receivedBy: "Tafadzwa Sibanda",
        amount: 450,
      },
      {
        date: "2026-06-13",
        student: "Kwame Okonkwo",
        form: "Form 3",
        method: "Bank",
        reference: "CBZ-44102",
        receivedBy: "Tafadzwa Sibanda",
        amount: 380,
      },
      {
        date: "2026-06-12",
        student: "Lindiwe Ndlovu",
        form: "Form 4",
        method: "Cash",
        reference: "CASH-0192",
        receivedBy: "Front office",
        amount: 200,
      },
      {
        date: "2026-06-11",
        student: "Sofia Alvarez",
        form: "Form 4",
        method: "Mobile Money",
        reference: "ECO-88101",
        receivedBy: "Tafadzwa Sibanda",
        amount: 450,
      },
    ],
    accountingKpis: {
      income: 10500,
      expenses: 4050,
      net: 6450,
      awaiting: 2,
    },
    ledger: [
      {
        date: "2026-06-14",
        reference: "JN-2204",
        account: "Tuition fees",
        type: "Income",
        approver: "Bursar",
        status: "Approved",
        amount: 4500,
      },
      {
        date: "2026-06-13",
        reference: "JN-2202",
        account: "Textbooks",
        type: "Expense",
        approver: "Deputy Head",
        status: "Pending approval",
        amount: 1850,
      },
      {
        date: "2026-06-12",
        reference: "JN-2201",
        account: "Utilities",
        type: "Expense",
        approver: "Bursar",
        status: "Approved",
        amount: 920,
      },
      {
        date: "2026-06-10",
        reference: "JN-2198",
        account: "Exam fees",
        type: "Income",
        approver: "Bursar",
        status: "Approved",
        amount: 2100,
      },
      {
        date: "2026-06-09",
        reference: "JN-2195",
        account: "Transport",
        type: "Expense",
        approver: "Deputy Head",
        status: "Pending approval",
        amount: 1280,
      },
    ],
    payrollKpis: {
      gross: 5660,
      deductions: 925,
      net: 4735,
      draft: 2,
    },
    payrollPeriod: "June 2026 run. Amounts shown in the school's base currency.",
    payroll: [
      {
        name: "Tendai Moyo",
        role: "Senior Teacher",
        gross: 920,
        deductions: 148,
        net: 772,
        status: "Approved",
      },
      {
        name: "Nyasha Chirwa",
        role: "Teacher",
        gross: 780,
        deductions: 122,
        net: 658,
        status: "Approved",
      },
      {
        name: "Farai Dube",
        role: "Teacher",
        gross: 780,
        deductions: 122,
        net: 658,
        status: "Draft",
      },
      {
        name: "Chipo Zulu",
        role: "Head of Department",
        gross: 1050,
        deductions: 178,
        net: 872,
        status: "Approved",
      },
      {
        name: "Kudzai Phiri",
        role: "Deputy Head",
        gross: 1240,
        deductions: 214,
        net: 1026,
        status: "Approved",
      },
    ],
    communicationKpis: {
      unread: 2,
      safeguarding: 2,
      avgReplyHrs: 8.5,
      announcements: 3,
    },
    conversations: [
      {
        id: "c1",
        from: "Chipo Zulu",
        role: "Head of Department",
        tags: ["Academic", "Unread"],
        time: "09:41",
        subject: "Term 2 moderation meeting",
        preview: "Can we lock Friday 14:00 for the Form 4 moderation panel?",
        tab: "Staff",
      },
      {
        id: "c2",
        from: "Tafadzwa Sibanda",
        role: "Bursar",
        tags: ["Fees"],
        time: "Yesterday",
        subject: "Arrears letters ready",
        preview: "Draft letters for 14 families are ready for your sign-off.",
        tab: "Staff",
      },
      {
        id: "c3",
        from: "Helen Brooks",
        role: "Parent",
        tags: ["Safeguarding"],
        time: "Mon",
        subject: "Concern about Form 2 Green",
        preview: "I'd like to discuss Ethan's recent attendance pattern.",
        tab: "Parent → Headmaster",
      },
      {
        id: "c4",
        from: "Office",
        role: "Announcements",
        tags: ["School-wide"],
        time: "Sun",
        subject: "Inter-house athletics Friday",
        preview: "All forms assemble at 08:00. Parents welcome from 10:00.",
        tab: "Announcements",
      },
    ],
    reports: [
      {
        title: "Term 1 report cards",
        description: "Published pack for Forms 1–4",
        updated: "2026-04-02",
      },
      {
        title: "Student registry export",
        description: "Full roll with guardian contacts",
        updated: "2026-06-10",
      },
      {
        title: "Fees arrears summary",
        description: "Balances overdue > 30 days",
        updated: "2026-06-14",
      },
      {
        title: "Enrolment by form",
        description: "Capacity vs filled seats",
        updated: "2026-06-01",
      },
    ],
    intelligence: [
      {
        title: "Form 2 Green attendance risk",
        body: "Three students dropped below 80% attendance in the last fortnight. Pastoral follow-up recommended.",
        severity: "warn",
      },
      {
        title: "English grading backlog",
        body: "28 assessments are still unmarked against the scheme of work. Average chase time is 4.2 days.",
        severity: "warn",
      },
      {
        title: "Fees collection on track",
        body: "Collections are 6% ahead of the same point last term. Arrears letters for 14 families are ready.",
        severity: "ok",
      },
      {
        title: "Science stream progress",
        body: "Combined Science curriculum coverage is ahead of plan at 78% for the term.",
        severity: "info",
      },
    ],
  };
}

export function metricTone(value: number, good = 85, warn = 70): "good" | "warn" | "bad" {
  if (value >= good) return "good";
  if (value >= warn) return "warn";
  return "bad";
}

export type StaffDetail = StaffMember & {
  email: string;
  phone: string;
  joined: string;
  employeeId: string;
  qualifications: string[];
  classes: { name: string; subject: string; students: number; room: string; period: string }[];
  recentGrading: { assignment: string; className: string; due: string; graded: string; pending: number }[];
  attendanceLog: { date: string; status: "Present" | "Late" | "Leave"; note?: string }[];
  messages: { with: string; subject: string; date: string; unread: boolean }[];
  notes: string[];
};

export type StudentDetail = StudentRecord & {
  studentId: string;
  dob: string;
  gender: string;
  house: string;
  email: string;
  subjects: { name: string; teacher: string; mark: number; grade: string; trend: "up" | "down" | "flat" }[];
  termHistory: { term: string; average: number; rank: number; attendance: number }[];
  attendanceLog: { date: string; status: "Present" | "Absent" | "Late"; period?: string }[];
  fees: {
    term: string;
    billed: number;
    paid: number;
    balance: number;
    payments: { date: string; method: string; amount: number; reference: string }[];
  };
  guardians: { name: string; relationship: string; phone: string; email: string; primary: boolean }[];
  pastoral: { date: string; type: string; by: string; note: string }[];
};

function emailFromName(name: string, domain: string) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@${domain}`;
}

export function getStaffDetail(
  schoolId: string | null | undefined,
  staffId: string,
): StaffDetail | null {
  const demo = getSchoolDemo(schoolId);
  const base = demo.staff.find((s) => s.id === staffId);
  if (!base) return null;

  const classMap: Record<string, StaffDetail["classes"]> = {
    t1: [
      { name: "4A Maths", subject: "Mathematics", students: 28, room: "B12", period: "Mon–Fri P2" },
      { name: "5B Maths", subject: "Mathematics", students: 24, room: "B12", period: "Mon/Wed/Fri P4" },
      { name: "6A Further Maths", subject: "Further Maths", students: 14, room: "B14", period: "Tue/Thu P3" },
    ],
    t2: [
      { name: "4A Sciences", subject: "Combined Science", students: 32, room: "Lab 2", period: "Mon–Fri P3" },
      { name: "3C Science", subject: "Combined Science", students: 30, room: "Lab 1", period: "Tue/Thu P1" },
    ],
    t3: [
      { name: "5A Literature", subject: "English Lit", students: 24, room: "A08", period: "Mon–Fri P1" },
      { name: "4B English", subject: "English Lang", students: 29, room: "A08", period: "Wed/Fri P5" },
    ],
    t4: [
      { name: "3C Accounts", subject: "Accounts", students: 30, room: "C04", period: "Mon–Thu P2" },
      { name: "5B Business", subject: "Business Studies", students: 22, room: "C04", period: "Tue/Fri P4" },
    ],
    t5: [
      { name: "Leadership briefings", subject: "Pastoral", students: 0, room: "Hall", period: "Mon 07:30" },
    ],
  };

  return {
    ...base,
    email: emailFromName(base.name, "chiremba.ac.zw"),
    phone: `+263 77 ${200 + staffId.charCodeAt(1)} ${1000 + base.gradingTimeliness}`,
    joined: "2019-01-14",
    employeeId: `EMP-${staffId.toUpperCase()}-${base.department.slice(0, 3).toUpperCase()}`,
    qualifications: [
      "B.Ed (University of Zimbabwe)",
      base.department === "Mathematics" ? "PGDE Mathematics" : "PGDE Secondary",
      "CPD: Inclusive classroom (2025)",
    ],
    classes: classMap[staffId] ?? classMap.t1!,
    recentGrading: [
      {
        assignment: "Term 2 Mid-cycle test",
        className: classMap[staffId]?.[0]?.name ?? "4A",
        due: "2026-06-10",
        graded: "2026-06-12",
        pending: base.gradingTimeliness < 80 ? 8 : 0,
      },
      {
        assignment: "Homework set 14",
        className: classMap[staffId]?.[0]?.name ?? "4A",
        due: "2026-06-08",
        graded: "2026-06-09",
        pending: base.gradingTimeliness < 75 ? 4 : 1,
      },
      {
        assignment: "Practical write-up",
        className: classMap[staffId]?.[1]?.name ?? "5B",
        due: "2026-06-05",
        graded: "2026-06-07",
        pending: 0,
      },
    ],
    attendanceLog: [
      { date: "2026-06-16", status: "Present" },
      { date: "2026-06-15", status: "Present" },
      { date: "2026-06-14", status: base.ownAttendance < 95 ? "Late" : "Present", note: "Traffic delay" },
      { date: "2026-06-13", status: "Present" },
      { date: "2026-06-12", status: "Leave", note: "CPD workshop" },
      { date: "2026-06-11", status: "Present" },
    ],
    messages: [
      {
        with: "Dr. Rudo Makoni",
        subject: "Moderation panel Friday",
        date: "2026-06-15",
        unread: true,
      },
      {
        with: "Parent — Patel family",
        subject: "Form 4 progress check-in",
        date: "2026-06-12",
        unread: false,
      },
      {
        with: "Chipo Zulu",
        subject: "Scheme of work update",
        date: "2026-06-09",
        unread: false,
      },
    ],
    notes: [
      "Strong classroom management; mentors two new teachers.",
      base.classAverage < 72
        ? "Class average below department target — coaching planned for Term 2."
        : "Class averages within department target band.",
      `Average parent reply time: ${base.parentReplyHrs} hours.`,
    ],
  };
}

export function getStudentDetail(
  schoolId: string | null | undefined,
  studentId: string,
): StudentDetail | null {
  const demo = getSchoolDemo(schoolId);
  const base = demo.students.find((s) => s.id === studentId);
  if (!base) return null;

  const subjects = [
    { name: "Mathematics", teacher: "Tendai Moyo", mark: base.average + 2, grade: "B", trend: "up" as const },
    { name: "English", teacher: "Farai Dube", mark: base.average - 4, grade: "C", trend: "down" as const },
    { name: "Combined Science", teacher: "Nyasha Chirwa", mark: base.average + 1, grade: "B", trend: "flat" as const },
    { name: "History", teacher: "Blessing Chirwa", mark: base.average - 1, grade: "B", trend: "up" as const },
    { name: "Geography", teacher: "Rudo Mhlanga", mark: base.average, grade: "B", trend: "flat" as const },
  ].map((s) => ({
    ...s,
    mark: Math.max(35, Math.min(98, s.mark)),
    grade: s.mark >= 80 ? "A" : s.mark >= 70 ? "B" : s.mark >= 60 ? "C" : "D",
  }));

  return {
    ...base,
    studentId: `STU-2026-${studentId.toUpperCase()}`,
    dob: "2011-04-18",
    gender: "—",
    house: ["Blue", "Green", "Red", "Gold"][studentId.charCodeAt(1) % 4]!,
    email: emailFromName(base.name, "student.chiremba.ac.zw"),
    subjects,
    termHistory: [
      { term: "Term 1 2026", average: base.average, rank: base.average > 85 ? 2 : 8, attendance: base.attendance },
      { term: "Term 3 2025", average: Math.min(98, base.average + 3), rank: 5, attendance: Math.min(99, base.attendance + 2) },
      { term: "Term 2 2025", average: Math.max(50, base.average - 2), rank: 11, attendance: Math.max(70, base.attendance - 3) },
    ],
    attendanceLog: [
      { date: "2026-06-16", status: "Present", period: "Full day" },
      { date: "2026-06-15", status: base.attendance < 80 ? "Absent" : "Present", period: "Full day" },
      { date: "2026-06-14", status: "Present", period: "Full day" },
      { date: "2026-06-13", status: base.attendance < 85 ? "Late" : "Present", period: "Arrived P2" },
      { date: "2026-06-12", status: "Present", period: "Full day" },
      { date: "2026-06-11", status: base.attendance < 80 ? "Absent" : "Present", period: "Full day" },
    ],
    fees: {
      term: "Term 2 2026",
      billed: 900,
      paid: 900 - base.balance,
      balance: base.balance,
      payments:
        base.balance === 900
          ? []
          : base.balance === 0
            ? [
                {
                  date: "2026-05-02",
                  method: "Mobile Money",
                  amount: 450,
                  reference: "ECO-77102",
                },
                {
                  date: "2026-06-01",
                  method: "Bank",
                  amount: 450,
                  reference: "CBZ-33011",
                },
              ]
            : [
                {
                  date: "2026-05-02",
                  method: "Mobile Money",
                  amount: 900 - base.balance,
                  reference: "ECO-77102",
                },
              ],
    },
    guardians: [
      {
        name: `${base.name.split(" ").slice(-1)[0] ?? "Family"} (guardian)`,
        relationship: "Parent / Guardian",
        phone: "+263 71 555 0142",
        email: emailFromName(`guardian.${base.name}`, "mail.com"),
        primary: true,
      },
      {
        name: "Emergency contact",
        relationship: "Relative",
        phone: "+263 77 555 0199",
        email: "—",
        primary: false,
      },
    ],
    pastoral: [
      ...(base.alerts.length
        ? base.alerts.map((a, i) => ({
            date: `2026-06-${10 + i}`,
            type: a.kind,
            by: "Pastoral team",
            note: a.detail,
          }))
        : [
            {
              date: "2026-05-20",
              type: "Wellbeing check",
              by: "Form teacher",
              note: "Settled well this term. No concerns raised.",
            },
          ]),
      {
        date: "2026-04-02",
        type: "Parent meeting",
        by: "Deputy Head",
        note: "Discussed Term 1 report and enrichment options.",
      },
    ],
  };
}

