import { useCallback, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import klevaMark from "@/assets/kleva-mark.svg";
import zikicashLogo from "@/assets/zikicash-logo.png";
import cbzLogo from "@/assets/cbz-logo.png";
import enbeeLogo from "@/assets/enbee-logo.png";
import redSphereLogo from "@/assets/red-sphere-logo.png";
import aiecLogo from "@/assets/aiec-logo.png";
import cimasLogo from "@/assets/cimas-logo.svg";
import { useFamily } from "@/contexts/FamilyContext";
import { cn } from "@/lib/utils";

export const ZIKIMALL_URL = "https://zikimall.com/";
export const ENBEE_URL = "https://www.enbee.co.zw";
export const AIEC_URL = "https://www.aiec.africa/";
export const CIMAS_URL = "https://cimas.co.zw/our-packages/";

const ROTATE_MS = 10_000;

const slides = [
  { id: "zikicash", label: "zikicash" },
  { id: "cbz", label: "Kleva and CBZ partnership" },
  { id: "redsphere", label: "Kleva and Red Sphere partnership" },
  { id: "enbee", label: "Kleva and Enbee partnership" },
  { id: "aiec", label: "Kleva and AIEC partnership" },
  { id: "cimas", label: "Kleva and Cimas partnership" },
] as const;

export function ZikimallBanner() {
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [dragHeld, setDragHeld] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const paused = hoverPaused || dragHeld || reduceMotion;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 22,
    watchDrag: true,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    emblaApi?.reInit({
      loop: true,
      align: "start",
      duration: reduceMotion ? 0 : 22,
      watchDrag: true,
    });
  }, [emblaApi, reduceMotion]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncIndex = () => setIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => setDragHeld(true);
    const onPointerUp = () => setDragHeld(false);

    syncIndex();
    emblaApi.on("select", syncIndex);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("select", syncIndex);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [emblaApi, paused, index]);

  const goTo = useCallback(
    (slideIndex: number) => {
      emblaApi?.scrollTo(slideIndex);
    },
    [emblaApi],
  );

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setHoverPaused(false);
        }
      }}
    >
      <div
        ref={emblaRef}
        className="cursor-grab overflow-hidden rounded-[1.75rem] shadow-sm ring-1 ring-black/[0.06] active:cursor-grabbing"
        aria-roledescription="carousel"
        aria-label="Promotions"
      >
        <div className="flex items-stretch">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex min-w-0 shrink-0 grow-0 basis-full select-none"
              role="group"
              aria-roledescription="slide"
              aria-label={slide.label}
            >
              <BannerSlide id={slide.id} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-current={active ? "true" : undefined}
              onClick={() => goTo(slideIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                active ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25 hover:bg-foreground/50",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function BannerSlide({ id }: { id: (typeof slides)[number]["id"] }) {
  switch (id) {
    case "zikicash":
      return <ZikicashSlide />;
    case "cbz":
      return <CbzPartnershipSlide />;
    case "redsphere":
      return <RedSpherePartnershipSlide />;
    case "enbee":
      return <EnbeePartnershipSlide />;
    case "aiec":
      return <AiecPartnershipSlide />;
    case "cimas":
      return <CimasPartnershipSlide />;
  }
}

function ZikicashSlide() {
  return (
    <PartnershipSlide
      brand="zikicash"
      accent="#F07818"
      accent2="#F5B400"
      panel="#2B1570"
      panel2="#4A1FA6"
      headline="Send USD cash to your loved ones instantly."
      body="Send USD from the UK to Zimbabwe securely and instantly. Your loved ones can cash out at any CBZ ATM, branch, agent or receive directly into their bank account."
      logo={zikicashLogo}
      logoAlt="zikicash, powered by CBZ Holdings"
      logoClassName="h-auto w-[12.5rem] sm:w-64"
      cta={
        <a
          href={ZIKIMALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#F07818] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Send Money Now
        </a>
      }
    />
  );
}

function CbzPartnershipSlide() {
  const { isParent, isOrganization } = useFamily();
  const financeCta = isOrganization
    ? { to: "/finance/school", label: "Explore organization finance" }
    : isParent
      ? { to: "/finance/home", label: "Explore finance" }
      : null;

  return (
    <PartnershipSlide
      brand="CBZ"
      accent="#D4A017"
      accent2="#E30613"
      panel="#071A33"
      panel2="#0D3A6B"
      headline="School fees, backed by a bank you trust."
      body="Kleva has partnered with CBZ so families can pay school fees, apply for education finance, and bank with Zimbabwe's trusted name, all from one place."
      logo={cbzLogo}
      logoAlt="CBZ Holdings"
      logoClassName="h-12 w-auto sm:h-14"
      cta={
        financeCta ? (
          <Link
            to={financeCta.to}
            className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#D4A017] px-7 text-sm font-semibold text-[#071A33] transition-opacity hover:opacity-90"
          >
            {financeCta.label}
          </Link>
        ) : (
          <p className="mt-7 text-sm text-neutral-500">
            Available on parent accounts in Kleva Finance.
          </p>
        )
      }
    />
  );
}

function EnbeePartnershipSlide() {
  return (
    <PartnershipSlide
      brand="Enbee"
      accent="#F15A22"
      accent2="#F5B400"
      panel="#1B2744"
      panel2="#2C3F68"
      headline="School uniforms, from a name families trust."
      body="Kleva has partnered with Enbee, Zimbabwe's leading schoolwear supplier since 1959, so families can shop quality uniforms, sportswear, and accessories at branches nationwide."
      logo={enbeeLogo}
      logoAlt="Enbee, you, me and schoolwear"
      logoClassName="h-14 w-auto sm:h-16"
      cta={
        <a
          href={ENBEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F15A22" }}
        >
          Shop Enbee
        </a>
      }
    />
  );
}

function RedSpherePartnershipSlide() {
  const { isParent, isOrganization } = useFamily();
  const financeCta = isOrganization
    ? { to: "/finance/school", label: "Explore organization finance" }
    : isParent
      ? { to: "/finance/apply", label: "Apply for education finance" }
      : null;

  return (
    <PartnershipSlide
      brand="Red Sphere"
      accent="#E30613"
      accent2="#FF6B73"
      panel="#1A0A0C"
      panel2="#4A0F14"
      headline="School fees loans, made possible."
      body="Kleva has partnered with Red Sphere Finance, the CBZ Holdings microfinance arm, so families can apply for education loans — whether or not they bank with CBZ."
      logo={redSphereLogo}
      logoAlt="Red Sphere Finance, a member of the CBZ Group"
      logoClassName="h-10 w-auto sm:h-12"
      cta={
        financeCta ? (
          <Link
            to={financeCta.to}
            className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#E30613] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {financeCta.label}
          </Link>
        ) : (
          <p className="mt-7 text-sm text-neutral-500">
            Available on parent accounts in Kleva Finance.
          </p>
        )
      }
    />
  );
}

function AiecPartnershipSlide() {
  return (
    <PartnershipSlide
      brand="AIEC"
      accent="#D7BF76"
      accent2="#F3E4B0"
      panel="#7A1219"
      panel2="#C42A34"
      headline="Textbooks and training, from Zimbabwe's education supplier."
      body="Kleva has partnered with the Africa International Education Centre so families and schools can source Cambridge, Oxford, Collins and more — plus teacher training and learning resources."
      logo={aiecLogo}
      logoAlt="Africa International Education Centre"
      logoOnWhite={false}
      logoClassName="h-[4.5rem] w-auto sm:h-24"
      cta={
        <a
          href={AIEC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#A11C24] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Shop textbooks
        </a>
      }
    />
  );
}

function CimasPartnershipSlide() {
  return (
    <PartnershipSlide
      brand="Cimas"
      accent="#277FC2"
      accent2="#7EC8E3"
      panel="#0B3B5C"
      panel2="#1A6FA8"
      headline="Family medical aid, from a name Zimbabwe trusts."
      body="Kleva has partnered with Cimas Health Group so families can compare medical aid packages and get cover for school-age children, from Secure USD plans to Healthguard."
      logo={cimasLogo}
      logoAlt="Cimas Health Group"
      logoClassName="h-20 w-auto sm:h-24"
      cta={
        <a
          href={CIMAS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#277FC2] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View Cimas packages
        </a>
      }
    />
  );
}

function PartnershipSlide({
  brand,
  accent,
  accent2,
  panel,
  panel2,
  headline,
  body,
  logo,
  logoAlt,
  logoOnWhite = true,
  logoClassName = "h-10 w-auto sm:h-12",
  cta,
}: {
  brand: string;
  accent: string;
  accent2: string;
  panel: string;
  panel2: string;
  headline: string;
  body: string;
  logo: string;
  logoAlt: string;
  logoOnWhite?: boolean;
  logoClassName?: string;
  cta: ReactNode;
}) {
  return (
    <section className="isolate flex h-full min-h-[320px] w-full flex-col overflow-hidden bg-white text-[#1A1A1A] md:min-h-[380px]">
      <div className="grid h-full min-h-[320px] flex-1 md:min-h-[380px] md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-center px-7 py-8 sm:px-10 sm:py-10 lg:px-12">
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              color: accent,
              borderColor: `${accent}33`,
              backgroundColor: `${accent}1A`,
            }}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Exclusive partnership [DEMO]
          </span>

          <div className="mt-6 flex items-center gap-3">
            <img src={klevaMark} alt="" draggable={false} className="h-8 w-8" />
            <p className="text-sm font-semibold tracking-tight">
              Kleva <span className="mx-1" style={{ color: accent }}>×</span> {brand}
            </p>
          </div>

          <h2 className="mt-4 max-w-md text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:text-[2.15rem] lg:text-[2.35rem]">
            {headline}
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            {body}
          </p>

          {cta}
        </div>

        <div
          className="relative isolate h-full min-h-[240px] overflow-hidden md:min-h-full"
          style={{
            background: `linear-gradient(145deg, ${panel2} 0%, ${panel} 55%, ${panel} 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full blur-2xl"
            style={{ backgroundColor: accent, opacity: 0.28 }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-10 h-80 w-80 rounded-full blur-2xl"
            style={{ backgroundColor: accent2, opacity: 0.22 }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `${accent2}55` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `${accent}33` }}
            aria-hidden
          />

          <svg
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
            viewBox="0 0 480 420"
            preserveAspectRatio="xMaxYMax slice"
            aria-hidden
          >
            <polygon points="480,90 480,420 230,420" fill={accent} opacity="0.9" />
            <polygon points="480,250 480,420 290,420" fill={accent2} opacity="0.92" />
          </svg>

          <div className="absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-white to-transparent md:w-8" />

          <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-5 px-8 py-10">
            <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
              <img src={klevaMark} alt="" draggable={false} className="h-5 w-5" />
              <span>
                Kleva <span className="mx-0.5 opacity-70">×</span> {brand}
              </span>
            </div>

            <div
              className={cn(
                "rounded-[1.75rem] px-8 py-7",
                logoOnWhite
                  ? "bg-white shadow-2xl ring-1 ring-black/5"
                  : "bg-black/35 shadow-2xl ring-1 ring-white/15 backdrop-blur-md",
              )}
            >
              <img src={logo} alt={logoAlt} draggable={false} className={logoClassName} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
