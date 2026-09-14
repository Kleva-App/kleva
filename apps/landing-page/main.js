const toggle = document.querySelector("[data-nav-toggle]");
const mobile = document.querySelector("[data-nav-mobile]");
const toggleOpen = document.querySelector("[data-toggle-open]");
const toggleClose = document.querySelector("[data-toggle-close]");
const nav = document.querySelector(".nav");

const isLocal =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

const API_BASE = isLocal
  ? "http://localhost:3001"
  : "https://server-l3dm.onrender.com";

const PORTALS = isLocal
  ? { student: "http://localhost:5173", teacher: "http://localhost:5174" }
  : { student: "https://student.joinkleva.app", teacher: "https://teacher.joinkleva.app" };

document.querySelectorAll("[data-portal]").forEach((link) => {
  const dest = PORTALS[link.getAttribute("data-portal")];
  if (!dest) return;
  const path = link.getAttribute("data-portal-path") || "";
  link.setAttribute("href", dest.replace(/\/$/, "") + path);
  if (link.hasAttribute("data-portal-same-tab")) {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  } else {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  }
});

function setMenu(open) {
  mobile?.classList.toggle("is-open", open);
  nav?.classList.toggle("is-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  if (toggleOpen && toggleClose) {
    toggleOpen.hidden = open;
    toggleClose.hidden = !open;
  }
}

toggle?.addEventListener("click", () => {
  setMenu(!mobile?.classList.contains("is-open"));
});

mobile?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobile?.classList.contains("is-open")) {
    setMenu(false);
  }
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

// Scrollspy: highlight the nav link for the section currently in view
const spyLinks = Array.from(document.querySelectorAll(".nav__links a[href^='#']"));
const spySections = spyLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function syncNav() {
  nav?.classList.toggle("is-scrolled", window.scrollY > 8);

  const threshold = window.innerHeight * 0.35;
  let activeIndex = -1;
  spySections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= threshold) activeIndex = i;
  });
  spyLinks.forEach((link, i) => {
    link.classList.toggle("is-active", i === activeIndex);
  });
}

syncNav();
window.addEventListener("scroll", syncNav, { passive: true });

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

// Count up the stat band numbers the first time they scroll into view
const statValues = Array.from(document.querySelectorAll(".statband__item strong"));

if (
  statValues.length &&
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        statObserver.unobserve(entry.target);

        const original = entry.target.textContent || "";
        const match = original.match(/^(\d+)([\s\S]*)$/);
        if (!match) continue;

        const target = Number(match[1]);
        const suffix = match[2];
        const duration = 1100;
        const startTime = performance.now();

        const tick = (now) => {
          const t = Math.min(1, (now - startTime) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          entry.target.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
          else entry.target.textContent = original;
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 },
  );

  statValues.forEach((el) => statObserver.observe(el));
}

// Pinned features scrollytelling: the stage sticks while the user scrolls
// through the tall track; scroll progress scrubs one full-width panel in
// (and the previous one out) at a time.
const featuresTrack = document.querySelector("[data-features-track]");
const featurePanels = Array.from(document.querySelectorAll("[data-feature-panel]"));
const featureSegs = Array.from(document.querySelectorAll("[data-feature-seg]"));

if (featuresTrack && featurePanels.length) {
  const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMq = window.matchMedia("(min-width: 821px)");
  const count = featurePanels.length;
  let ticking = false;
  let wasActive = false;

  function clearStyles() {
    featurePanels.forEach((panel) => {
      panel.style.opacity = "";
      panel.style.transform = "";
      panel.style.pointerEvents = "";
    });
  }

  function updatePanels() {
    ticking = false;

    const active = desktopMq.matches && !reducedMotionMq.matches;
    if (!active) {
      if (wasActive) clearStyles();
      wasActive = false;
      return;
    }
    wasActive = true;

    const rect = featuresTrack.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

    featurePanels.forEach((panel, i) => {
      // Signed distance from this panel's "center of attention", in panels.
      let d = (progress - (i + 0.5) / count) * count;
      // First panel is already in place on arrival; last one holds at the end.
      if (i === 0) d = Math.max(d, 0);
      if (i === count - 1) d = Math.min(d, 0);

      // Fully visible while |d| < 0.24, fading to nothing by |d| = 0.5
      const alpha = Math.min(1, Math.max(0, 1 - (Math.abs(d) - 0.24) / 0.26));

      panel.style.opacity = alpha.toFixed(3);
      panel.style.transform = `translateY(${(-d * 130).toFixed(1)}px) scale(${(0.95 + alpha * 0.05).toFixed(3)})`;
      panel.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
    });

    featureSegs.forEach((seg, i) => {
      const fill = Math.min(1, Math.max(0, progress * count - i));
      seg.style.setProperty("--fill", fill.toFixed(3));
    });
  }

  function requestPanelsUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updatePanels);
    }
  }

  window.addEventListener("scroll", requestPanelsUpdate, { passive: true });
  window.addEventListener("resize", requestPanelsUpdate);
  updatePanels();
}

const form = document.querySelector("[data-demo-form]");
const statusEl = document.querySelector("[data-demo-status]");
const submitBtn = document.querySelector("[data-demo-submit]");
const successEl = document.querySelector("[data-demo-success]");

function setStatus(message, tone) {
  if (!statusEl) return;
  if (!message) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.removeAttribute("data-tone");
    return;
  }
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.setAttribute("data-tone", tone);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!(form instanceof HTMLFormElement)) return;

  const data = new FormData(form);
  const payload = {
    fullName: String(data.get("fullName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    organization: String(data.get("organization") || "").trim(),
    role: String(data.get("role") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };

  if (!payload.fullName || !payload.email || !payload.organization || !payload.role) {
    setStatus("Please fill in all required fields.", "error");
    return;
  }

  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.disabled = true;
  }
  setStatus("Sending…", "pending");

  try {
    const res = await fetch(`${API_BASE}/api/demo-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Something went wrong. Please try again.");
    }

    form.hidden = true;
    setStatus("");
    if (successEl) successEl.hidden = false;
  } catch (err) {
    setStatus(
      err instanceof Error ? err.message : "Something went wrong. Please try again.",
      "error",
    );
    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = false;
    }
  }
});
