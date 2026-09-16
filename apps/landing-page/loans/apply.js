(() => {
const SCHOOLS = [
  "Peterhouse Group of Schools",
  "Falcon College",
  "St George's College",
  "Dominican Convent High School",
  "Chisipite Senior School",
  "Watershed College",
  "Prince Edward School",
  "Girls High School",
  "Arundel School",
  "Hellenic Academy",
  "Gateway High School",
  "The Heritage School",
  "University of Zimbabwe",
  "National University of Science and Technology (NUST)",
  "Africa University",
];

const EMPLOYERS = [
  "Aether Holdings",
  "Econet Wireless Zimbabwe",
  "Delta Corporation",
  "Old Mutual Zimbabwe",
  "Zimplats",
  "OK Zimbabwe",
  "TelOne",
  "ZESA Holdings",
  "Government of Zimbabwe (Civil Service)",
  "NetOne",
  "Lumina Bank",
  "Ridgeway Bank",
  "Nyaradzo Group",
  "Innscor Africa",
  "Simbisa Brands",
];

const STEP_LABELS = [
  "Applicant details",
  "Employment",
  "Loan details",
  "Terms & signature",
  "Confirmation",
];

const usd = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function quote(amount, months) {
  const onceOff = amount * (0.01 + 0.01 + 0.012 + 0.02);
  const interest = amount * 0.0725 * (months / 12);
  const total = amount + onceOff + interest;
  return { onceOff, interest, total, monthly: months > 0 ? total / months : 0 };
}

function newReference() {
  return `KLV-RS-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`;
}

const form = document.querySelector("[data-apply-form]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const progress = document.querySelector("[data-progress]");
const progressFill = document.querySelector("[data-progress-fill]");
const progressLabel = document.querySelector("[data-progress-label]");
const progressPct = document.querySelector("[data-progress-pct]");

let step = 0;
let applicantType = "parent";
let signed = false;
let drawing = false;
let resizeSignature = () => {};

function field(name) {
  return form?.elements.namedItem(name);
}

function valueOf(name) {
  const el = field(name);
  if (!el || !("value" in el)) return "";
  const value = String(el.value).trim();
  return value === "+263" ? "" : value;
}

function setStatus(stepEl, message) {
  const status = stepEl?.querySelector("[data-step-status]");
  if (!status) return;
  if (!message) {
    status.hidden = true;
    status.textContent = "";
    return;
  }
  status.hidden = false;
  status.textContent = message;
}

function showStep(next) {
  step = next;
  steps.forEach((el) => {
    el.hidden = Number(el.dataset.step) !== step;
  });

  const inFlow = step > 0 && step < 5;
  progress?.classList.toggle("is-visible", inFlow);
  if (progressFill && progressLabel && progressPct) {
    const current = Math.min(step, 5);
    progressFill.style.width = `${(current / 5) * 100}%`;
    progressLabel.textContent = `Step ${current} of 5 · ${STEP_LABELS[current - 1] || "Confirmation"}`;
    progressPct.textContent = `${Math.round((current / 5) * 100)}%`;
  }

  if (step === 2) {
    const employer = document.querySelector("[data-employer-display]");
    if (employer) employer.value = valueOf("employer");
    const note = document.querySelector("[data-employer-note]");
    if (note) {
      note.textContent = valueOf("employer")
        ? `We'll confirm this with ${valueOf("employer")}'s HR before disbursing funds.`
        : "We'll confirm employment with HR before disbursing funds.";
    }
  }

  if (step === 3) {
    const school = document.querySelector("[data-school-display]");
    if (school) school.value = valueOf("school");
    updateQuote();
  }

  if (step === 4) {
    const fullName = [valueOf("name"), valueOf("surname")].filter(Boolean).join(" ");
    const nameEl = document.querySelector("[data-full-name]");
    const dateEl = document.querySelector("[data-sign-date]");
    if (nameEl) nameEl.value = fullName;
    if (dateEl) {
      dateEl.value = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    requestAnimationFrame(() => resizeSignature());
  }

  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
}

function required(names, stepEl) {
  for (const name of names) {
    if (valueOf(name)) continue;
    const el = field(name);
    if (el && "focus" in el) el.focus();
    setStatus(stepEl, "Please fill in the required fields to continue.");
    return false;
  }
  setStatus(stepEl, "");
  return true;
}

function canAdvance(from) {
  const stepEl = steps.find((el) => Number(el.dataset.step) === from);
  if (from === 1) {
    return required(["name", "surname", "email", "nationalId", "phone", "address"], stepEl);
  }
  if (from === 2) {
    return required(
      ["employerContact", "employeeNumber", "profession", "netSalary", "kinFirstName", "kinPhone"],
      stepEl,
    );
  }
  if (from === 3) {
    const amount = Number(valueOf("amount")) || 0;
    if (amount <= 0) {
      setStatus(stepEl, "Enter a loan amount to see your quote and continue.");
      field("amount")?.focus?.();
      return false;
    }
    setStatus(stepEl, "");
    return true;
  }
  if (from === 4) {
    const agreed = Boolean(field("agreed")?.checked);
    if (!agreed || !signed) {
      setStatus(stepEl, "Please agree to the terms and add your signature.");
      return false;
    }
    setStatus(stepEl, "");
    return true;
  }
  return true;
}

function updateQuote() {
  const amount = Number(valueOf("amount")) || 0;
  const months = Number(valueOf("months")) || 12;
  const q = quote(amount, months);
  const total = document.querySelector("[data-quote-total]");
  const monthly = document.querySelector("[data-quote-monthly]");
  const monthsLabel = document.querySelector("[data-quote-months]");
  if (total) total.textContent = amount > 0 ? usd(q.total) : "—";
  if (monthly) monthly.textContent = amount > 0 ? usd(q.monthly) : "—";
  if (monthsLabel) monthsLabel.textContent = String(months);
}

function fillSuccess() {
  const amount = Number(valueOf("amount")) || 0;
  const months = Number(valueOf("months")) || 12;
  const q = quote(amount, months);
  const ref = newReference();

  document.querySelectorAll("[data-reference]").forEach((el) => {
    el.textContent = ref;
  });
  const greet = applicantType === "school" ? valueOf("contactPerson") : valueOf("name");
  document.querySelectorAll("[data-success-name]").forEach((el) => {
    el.textContent = greet ? `, ${greet}` : "";
  });

  document.querySelectorAll("[data-success-parent]").forEach((el) => {
    el.hidden = applicantType !== "parent";
  });
  document.querySelectorAll("[data-success-school]").forEach((el) => {
    el.hidden = applicantType !== "school";
  });

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  setText("[data-summary-school]", valueOf("school") || "—");
  setText("[data-summary-employer]", valueOf("employer") || "—");
  setText("[data-summary-amount]", amount > 0 ? usd(amount) : "—");
  setText("[data-summary-tenure]", `${months} months`);
  setText("[data-summary-monthly]", amount > 0 ? usd(q.monthly) : "—");
  setText("[data-summary-organization]", valueOf("organization") || "—");
  setText("[data-summary-contact]", valueOf("contactPerson") || "—");
  setText("[data-summary-email]", valueOf("schoolEmail") || "—");
  setText("[data-summary-phone]", valueOf("schoolPhone") || "—");
  setText("[data-summary-purpose]", valueOf("schoolPurpose") || "—");
}

function setApplicantType(next) {
  applicantType = next;
  document.querySelectorAll("[data-applicant-type]").forEach((btn) => {
    const active = btn.dataset.applicantType === next;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-applicant-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.applicantPanel !== next;
  });
}

function initSearchSelect(root) {
  const key = root.dataset.searchSelect;
  const options = key === "school" ? SCHOOLS : EMPLOYERS;
  const trigger = root.querySelector("[data-search-trigger]");
  const label = root.querySelector("[data-search-label]");
  const hidden = root.querySelector("[data-search-value]");
  const panel = root.querySelector("[data-search-panel]");
  const query = root.querySelector("[data-search-query]");
  const list = root.querySelector("[data-search-list]");
  const placeholder = label?.textContent || "";

  function close() {
    if (panel) panel.hidden = true;
  }

  function render(filter = "") {
    if (!list) return;
    const q = filter.trim().toLowerCase();
    const matches = options.filter((o) => o.toLowerCase().includes(q));
    list.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("li");
      empty.className = "search-select__empty";
      empty.textContent = "No matches";
      list.append(empty);
      return;
    }
    matches.forEach((option) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = option;
      if (hidden?.value === option) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        if (hidden) hidden.value = option;
        if (label) {
          label.textContent = option;
          label.classList.remove("is-placeholder");
        }
        close();
        syncStart();
      });
      li.append(btn);
      list.append(li);
    });
  }

  trigger?.addEventListener("click", () => {
    if (!panel) return;
    const willOpen = panel.hidden;
    document.querySelectorAll("[data-search-panel]").forEach((p) => {
      p.hidden = true;
    });
    panel.hidden = !willOpen;
    if (willOpen) {
      render(query?.value || "");
      query?.focus();
    }
  });

  query?.addEventListener("input", () => render(query.value));

  document.addEventListener("mousedown", (event) => {
    if (!root.contains(event.target)) close();
  });
}

function syncStart() {
  const start = document.querySelector("[data-apply-start]");
  const ready = Boolean(valueOf("school") && valueOf("employer"));
  if (start instanceof HTMLButtonElement) {
    start.disabled = !ready;
  }
  const hint = document.querySelector("[data-start-hint]");
  if (hint) hint.hidden = ready;
  const schoolSubmit = document.querySelector("[data-school-submit]");
  if (schoolSubmit instanceof HTMLButtonElement) {
    schoolSubmit.disabled = !(
      valueOf("organization") &&
      valueOf("contactPerson") &&
      valueOf("schoolEmail") &&
      valueOf("schoolPhone")
    );
  }
}

function initSignature() {
  const canvas = document.querySelector("[data-signature]");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = (force = false) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = window.devicePixelRatio || 1;
    const nextW = Math.round(rect.width * ratio);
    const nextH = Math.round(rect.height * ratio);
    if (!force && canvas.width === nextW && canvas.height === nextH) return;
    if (signed && !force) return;
    canvas.width = nextW;
    canvas.height = nextH;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f1635";
  };
  resizeSignature = (force = false) => size(force);
  window.addEventListener("resize", () => size(false));

  const pos = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    const p = pos(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    signed = true;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const p = pos(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    signed = true;
  });
  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });
  canvas.addEventListener("pointerleave", () => {
    drawing = false;
  });

  document.querySelector("[data-signature-clear]")?.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signed = false;
  });
}

function set(name, value) {
  const el = field(name);
  if (!el) return;
  if (typeof RadioNodeList !== "undefined" && el instanceof RadioNodeList) {
    Array.from(el).forEach((node) => {
      if (node instanceof HTMLInputElement) node.checked = node.value === value;
    });
    return;
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    el.checked = Boolean(value);
    return;
  }
  if ("value" in el) el.value = value;
}

function setSearchValue(key, value) {
  const root = document.querySelector(`[data-search-select="${key}"]`);
  if (!root) return;
  const hidden = root.querySelector("[data-search-value]");
  const label = root.querySelector("[data-search-label]");
  if (hidden) hidden.value = value;
  if (label) {
    label.textContent = value;
    label.classList.remove("is-placeholder");
  }
}

function fillSignature() {
  const canvas = document.querySelector("[data-signature]");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  resizeSignature(true);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w === 0 || h === 0) return;
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.62);
  ctx.bezierCurveTo(w * 0.28, h * 0.18, w * 0.42, h * 0.86, w * 0.58, h * 0.38);
  ctx.bezierCurveTo(w * 0.7, h * 0.12, w * 0.8, h * 0.72, w * 0.9, h * 0.46);
  ctx.stroke();
  signed = true;
}

function fillCurrentStep() {
  if (step === 5) return;

  if (step === 0) {
    if (applicantType === "school") {
      set("organization", "Gateway High School");
      set("contactPerson", "Rutendo Ncube");
      set("schoolEmail", "bursar@gateway.ac.zw");
      set("schoolPhone", "+263 242 700 111");
      set("schoolPurpose", "School fees bridging");
    } else {
      setSearchValue("school", "Gateway High School");
      setSearchValue("employer", "Econet Wireless Zimbabwe");
    }
  }

  if (step === 1) {
    set("title", "Mr");
    set("gender", "Male");
    set("name", "Tapiwa");
    set("surname", "Kundishora");
    set("maiden", "");
    set("dob", "1989-06-14");
    set("nationalId", "63-2145789 Q 47");
    set("passport", "FN1234567");
    set("email", "tapiwa.kundishora@example.com");
    set("countryOfBirth", "Zimbabwe");
    set("phone", "+263 771 234 567");
    set("bankName", "Lumina Bank");
    set("branchName", "Borrowdale");
    set("branchCode", "6101");
    set("accountNumber", "1002458891");
    set("residence", "Owned");
    set("address", "12 Samora Machel Avenue, Harare");
    set("yearsAtAddress", "6");
    set("maritalStatus", "Married");
  }

  if (step === 2) {
    set("employerContact", "Rutendo Chikafu");
    set("employerTel", "+263 242 798 000");
    set("employeeNumber", "ECON-44192");
    set("profession", "Software engineer");
    set("dateJoined", "2018-03-01");
    set("grossSalary", "1850");
    set("netSalary", "1420");
    set("kinFirstName", "Rudo");
    set("kinSurname", "Kundishora");
    set("kinAddress", "12 Samora Machel Avenue, Harare");
    set("kinPhone", "+263 773 889 221");
    set("kinRelationship", "Spouse");
  }

  if (step === 3) {
    set("purpose", "School fees");
    set("amount", "1500");
    set("months", "12");
    updateQuote();
  }

  if (step === 4) {
    set("agreed", true);
    requestAnimationFrame(() => fillSignature());
  }

  const stepEl = steps.find((el) => Number(el.dataset.step) === step);
  setStatus(stepEl, "");
  syncStart();
  updateQuote();
}

function resetForm() {
  form?.reset();
  signed = false;
  applicantType = "parent";
  setApplicantType("parent");
  document.querySelectorAll("[data-search-label]").forEach((label) => {
    label.classList.add("is-placeholder");
    if (label.dataset.placeholder) label.textContent = label.dataset.placeholder;
  });
  const canvas = document.querySelector("[data-signature]");
  const ctx = canvas instanceof HTMLCanvasElement ? canvas.getContext("2d") : null;
  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateQuote();
  syncStart();
  showStep(0);
}

form?.addEventListener("submit", (event) => event.preventDefault());

document.querySelectorAll("[data-applicant-type]").forEach((btn) => {
  btn.addEventListener("click", () => setApplicantType(btn.dataset.applicantType || "parent"));
});

document.querySelectorAll("[data-search-select]").forEach(initSearchSelect);
initSignature();

form?.addEventListener("input", () => {
  updateQuote();
  syncStart();
});
form?.addEventListener("change", () => {
  updateQuote();
  syncStart();
});

document.querySelector("[data-apply-start]")?.addEventListener("click", () => {
  if (!valueOf("school") || !valueOf("employer")) return;
  showStep(1);
});

document.querySelector("[data-school-submit]")?.addEventListener("click", () => {
  const stepEl = steps.find((el) => Number(el.dataset.step) === 0);
  if (
    !required(["organization", "contactPerson", "schoolEmail", "schoolPhone"], stepEl)
  ) {
    return;
  }
  fillSuccess();
  showStep(5);
});

document.querySelectorAll("[data-apply-back]").forEach((btn) => {
  btn.addEventListener("click", () => showStep(Math.max(0, step - 1)));
});

document.querySelectorAll("[data-apply-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!canAdvance(step)) return;
    showStep(step + 1);
  });
});

document.querySelector("[data-apply-submit]")?.addEventListener("click", () => {
  if (!canAdvance(4)) return;
  const submit = document.querySelector("[data-apply-submit]");
  if (submit instanceof HTMLButtonElement) {
    submit.disabled = true;
    submit.textContent = "Submitting…";
  }
  window.setTimeout(() => {
    fillSuccess();
    showStep(5);
    if (submit instanceof HTMLButtonElement) {
      submit.disabled = false;
      submit.textContent = "Submit application";
    }
  }, 650);
});

document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
document.querySelector("[data-reset]")?.addEventListener("click", resetForm);

window.addEventListener(
  "keydown",
  (event) => {
    if (event.defaultPrevented) return;
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.altKey || event.shiftKey) return;
    if (event.code !== "Slash" && event.key !== "/") return;
    event.preventDefault();
    fillCurrentStep();
  },
  true,
);

syncStart();
updateQuote();
showStep(0);
})();
