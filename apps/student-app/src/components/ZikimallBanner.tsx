import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import zikicashMark from "@/assets/zikicash-mark.svg";
import klevaMark from "@/assets/kleva-mark.svg";
import bannerPortrait from "@/assets/zikimall-banner-portrait.png";
import cbzBanner from "@/assets/kleva-cbz-banner.jpg";
import { useFamily } from "@/contexts/FamilyContext";
import { cn } from "@/lib/utils";

export const ZIKIMALL_URL = "https://zikimall.com/";

const ROTATE_MS = 10_000;

const slides = [
  { id: "zikicash", label: "zikicash" },
  { id: "cbz", label: "Kleva and CBZ partnership" },
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
              {slide.id === "zikicash" ? <ZikicashSlide /> : <CbzPartnershipSlide />}
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

function ZikicashSlide() {
  return (
    <section className="isolate flex h-full min-h-[320px] w-full flex-col overflow-hidden bg-white text-[#1A1A1A] md:min-h-[360px]">
      <div className="grid h-full min-h-[320px] flex-1 md:min-h-[360px] md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-7 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="flex items-center gap-2.5">
            <img src={zikicashMark} alt="" draggable={false} className="h-7 w-8" />
            <span className="text-[1.65rem] font-bold leading-none tracking-tight text-[#2B1570]">
              zikicash
            </span>
          </div>

          <h2 className="mt-6 max-w-md text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:text-[2.15rem] lg:text-[2.35rem]">
            Send USD cash to your loved ones instantly.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            Send USD from the UK to Zimbabwe securely and instantly. Your loved ones can cash
            out at any CBZ ATM, branch, agent or receive directly into their bank account.
          </p>

          <a
            href={ZIKIMALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full border-2 border-[#F07818] px-7 text-sm font-semibold text-[#F07818] transition-colors hover:bg-[#F07818] hover:text-white"
          >
            Send Money Now
          </a>
        </div>

        <div className="relative isolate h-full min-h-[240px] overflow-hidden bg-white md:min-h-full">
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 480 420"
            preserveAspectRatio="xMaxYMax slice"
            aria-hidden
          >
            <polygon points="480,70 480,420 210,420" fill="#E85D2A" />
            <polygon points="480,230 480,420 265,420" fill="#F5B400" />
          </svg>
          <img
            src={bannerPortrait}
            alt="A woman smiling as she sends money from her phone"
            draggable={false}
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-[center_20%]"
          />
        </div>
      </div>
    </section>
  );
}

function CbzPartnershipSlide() {
  const { isParent, isInstitution } = useFamily();
  const financeCta = isInstitution
    ? { to: "/finance/school", label: "Explore school finance" }
    : isParent
      ? { to: "/finance/home", label: "Explore finance" }
      : null;

  return (
    <section className="relative isolate flex h-full min-h-[320px] w-full flex-col overflow-hidden bg-[#071A33] text-white md:min-h-[360px]">
      <img
        src={cbzBanner}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071A33] via-[#071A33]/90 to-[#071A33]/20" />
      <div className="absolute inset-y-0 right-0 w-1.5 bg-[#D4A017]" />

      <div className="relative flex h-full min-h-[320px] flex-1 flex-col justify-center px-7 py-8 sm:px-10 sm:py-10 md:min-h-[360px] lg:px-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-[#D4A017]" />
            Exclusive partnership
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <img src={klevaMark} alt="" draggable={false} className="h-8 w-8" />
          <p className="text-sm font-semibold tracking-tight">
            Kleva <span className="mx-1 text-[#D4A017]">×</span> CBZ
          </p>
        </div>

        <h2 className="mt-4 max-w-md text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:text-[2.15rem] lg:text-[2.35rem]">
          School fees, backed by a bank you trust.
        </h2>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]">
          Kleva has partnered with CBZ so families can pay school fees, apply for education
          finance, and bank with Zimbabwe&apos;s trusted name, all from one place.
        </p>

        {financeCta ? (
          <Link
            to={financeCta.to}
            className="mt-7 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[#D4A017] px-7 text-sm font-semibold text-[#071A33] transition-colors hover:bg-[#e0b122]"
          >
            {financeCta.label}
          </Link>
        ) : (
          <p className="mt-7 text-sm text-white/70">Available on parent accounts in Kleva Finance.</p>
        )}
      </div>
    </section>
  );
}
