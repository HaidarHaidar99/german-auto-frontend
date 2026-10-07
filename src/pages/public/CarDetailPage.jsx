import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import carsService from "../../services/cars/cars.service";
import CarMediaGallery from "../../components/car-detail/CarMediaGallery";
import CarTechnicalSpecs from "../../components/car-detail/CarTechnicalSpecs";
import CarEquipment from "../../components/car-detail/CarEquipment";
import CarContactCard from "../../components/car-detail/CarContactCard";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Production Car Detail Page
 * Dynamic route: /cars/:identifier (UUID or Slug)
 * Loaded exclusively from real backend API and CMS settings.
 */
export function CarDetailPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["cars", "common", "navigation"]);
  const { settings } = useSettings();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const shareTimeoutRef = useRef(null);

  const pageContainerRef = useRef(null);
  const contentSectionRef = useRef(null);

  // Fetch real vehicle from backend API
  const fetchCar = useCallback(async () => {
    if (!identifier) return;
    try {
      setLoading(true);
      setError(null);
      const res = await carsService.getCar(identifier);
      if (res?.data?.car) {
        setCar(res.data.car);
      } else {
        setCar(null);
      }
    } catch (err) {
      if (err?.statusCode === 404) {
        setCar(null);
      } else {
        setError(err?.message || "Fehler beim Laden der Fahrzeugdetails.");
      }
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchCar();
    // Scroll to top upon navigating to a new car
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, [fetchCar]);

  const handleShare = async () => {
    if (!car) return;
    const shareUrl = window.location.origin + `/cars/${car.slug || car.id}`;
    const carName = car.title || car.name || car.model || "";
    const shareTitle = `${car.brand || ""} ${carName}`.trim();
    const siteName = settings?.site?.name || "König Automobile";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} | ${siteName}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") {
          return; // User cancelled
        }
      }
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setShareCopied(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => {
        setShareCopied(false);
      }, 3000);
    } catch {
      // Fallback in case clipboard fails
    }
  };

  // Dynamic SEO metadata updates
  useEffect(() => {
    if (!car) return;
    const siteName = settings?.site?.name || "König Automobile Rheinberg";
    const carTitle = `${car.brand || ""} ${car.title || car.name || car.model || ""}`.trim();
    document.title = `${carTitle} | ${siteName}`;

    const desc = car.description_de || car.description_en || "";
    if (desc) {
      let metaTag = document.querySelector('meta[name="description"]');
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = "description";
        document.head.appendChild(metaTag);
      }
      metaTag.content = desc.slice(0, 160);
    }
  }, [car, settings]);

  // Entrance animations using GSAP context
  useGsapContext(
    pageContainerRef,
    () => {
      if (isReducedMotion() || loading || !car) return;

      gsap.from(".car-header-animate", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".car-media-animate", {
        opacity: 0,
        scale: 0.98,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.1,
      });

      gsap.from(".car-sidebar-animate", {
        opacity: 0,
        x: 25,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
    },
    [loading, car]
  );

  // ─── 1. LOADING SKELETON ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main
        className="car-detail-page-skeleton"
        style={{
          minHeight: "80vh",
          padding: "var(--space-xl) clamp(16px, 3.5vw, 36px) var(--space-4xl)",
          maxWidth: "1360px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <Skeleton width="180px" height="20px" style={{ marginBottom: "var(--space-sm)" }} />
          <Skeleton width="340px" height="38px" style={{ marginBottom: "var(--space-xs)" }} />
          <Skeleton width="220px" height="20px" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-2xl)",
          }}
        >
          <div>
            <Skeleton width="100%" height="480px" borderRadius="var(--radius-lg)" style={{ marginBottom: "var(--space-md)" }} />
            <div style={{ display: "flex", gap: "var(--space-xs)" }}>
              <Skeleton width="100px" height="60px" />
              <Skeleton width="100px" height="60px" />
              <Skeleton width="100px" height="60px" />
              <Skeleton width="100px" height="60px" />
            </div>
          </div>
          <div>
            <Skeleton width="100%" height="340px" borderRadius="var(--radius-lg)" />
          </div>
        </div>
      </main>
    );
  }

  // ─── 2. ERROR STATE ───────────────────────────────────────────────────────
  if (error) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-xl)" }}>
        <ErrorState
          title={t("errorLoading", { defaultValue: "Fehler beim Laden" })}
          message={error}
          onRetry={fetchCar}
        />
      </main>
    );
  }

  // ─── 3. NOT FOUND / EMPTY STATE ───────────────────────────────────────────
  if (!car) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-xl)" }}>
        <EmptyState
          title={t("carNotFound")}
          message={t("carNotFoundMsg")}
          actionLabel={t("backToInventory")}
          onAction={() => navigate("/cars")}
        />
      </main>
    );
  }

  // Language-sensitive description fallback
  const description =
    (i18n.language === "de"
      ? car.description_de || car.description_en
      : car.description_en || car.description_de) || "";

  return (
    <main
      ref={pageContainerRef}
      className="car-detail-page"
      style={{
        maxWidth: "1360px",
        margin: "0 auto",
        padding: "var(--space-xl) clamp(16px, 3.5vw, 36px) var(--space-4xl)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ─── Breadcrumb & Navigation Trail (Home / Cars / Car Model + Name) ─ */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "var(--space-lg)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            transition: "color var(--duration-fast) var(--ease-smooth)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <Icon name="home" size={14} />
          <span>{t("navigation:home", "Startseite")}</span>
        </Link>

        <span style={{ color: "var(--color-text-muted, #71717a)", opacity: 0.65 }}>/</span>

        <Link
          to="/cars"
          style={{
            color: "var(--color-text-muted)",
            textDecoration: "none",
            transition: "color var(--duration-fast) var(--ease-smooth)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <span>{t("navigation:cars", t("cars:title", "Fahrzeuge"))}</span>
        </Link>

        <span style={{ color: "var(--color-text-muted, #71717a)", opacity: 0.65 }}>/</span>

        <span
          style={{
            color: "#D4AF37",
            fontWeight: 600,
          }}
        >
          {`${car.brand || ""} ${car.title || car.name || car.model || ""}`.trim()}
        </span>
      </nav>

      {/* ─── Vehicle Header & Actions (Brand, Name, Share Button) ────────── */}
      <header
        className="car-header-animate"
        style={{
          marginBottom: "var(--space-xl)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "var(--space-2xs)" }}>
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                color: "var(--color-secondary)",
              }}
            >
              {car.brand}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.15,
              margin: 0,
              color: "var(--color-text)",
            }}
          >
            {car.title || car.name || car.model}
          </h1>
        </div>

        {/* Share Button near the top of the vehicle detail page */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
          <button
            type="button"
            onClick={handleShare}
            aria-label={t("shareVehicle", { defaultValue: "Fahrzeug teilen" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-full, 9999px)",
              backgroundColor: shareCopied ? "rgba(16, 185, 129, 0.15)" : "var(--color-surface, rgba(255, 255, 255, 0.06))",
              border: "1px solid",
              borderColor: shareCopied ? "#10b981" : "var(--color-border-subtle, rgba(255, 255, 255, 0.12))",
              color: shareCopied ? "#34d399" : "var(--color-text)",
              fontSize: "var(--font-size-sm, 14px)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Icon name={shareCopied ? "check" : "share-2"} size={16} color={shareCopied ? "#34d399" : "#D4AF37"} />
            <span>{shareCopied ? t("linkCopied", { defaultValue: "Link kopiert!" }) : t("share", { defaultValue: "Teilen" })}</span>
          </button>
        </div>
      </header>

      {/* ─── Two-Column Luxury Automotive Layout ───────────────────────── */}
      <div
        ref={contentSectionRef}
        className="car-detail-main-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-2xl)",
          alignItems: "start",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left Column: Media Stage, Specs, Description & Equipment */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Cinematic Media Area */}
          <div className="car-media-animate" style={{ marginBottom: "var(--space-2xl)" }}>
            <CarMediaGallery car={car} />
          </div>

          {/* Key Specifications & Technical Table */}
          <CarTechnicalSpecs car={car} />

          {/* Real Equipment Features Grid */}
          <CarEquipment equipment={car.equipment} />

          {/* Editorial Vehicle Description */}
          {description ? (
            <section
              className="car-description-section"
              aria-labelledby="description-heading"
              style={{
                backgroundColor: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-lg) var(--space-xl)",
                marginBottom: "var(--space-xl)",
              }}
            >
              <h3
                id="description-heading"
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  letterSpacing: "var(--tracking-tight)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-xs)",
                  color: "var(--color-text)",
                }}
              >
                <Icon name="file-text" size={20} color="var(--color-secondary)" />
                <span>{t("descriptionTitle")}</span>
              </h3>
              <div
                style={{
                  fontSize: "var(--font-size-base)",
                  lineHeight: "var(--line-height-relaxed)",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-line",
                }}
              >
                {description}
              </div>
            </section>
          ) : (
            <section
              className="car-description-section"
              style={{
                backgroundColor: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-lg) var(--space-xl)",
                marginBottom: "var(--space-xl)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-medium)",
                  marginBottom: "var(--space-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("descriptionTitle")}
              </h3>
              <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)", margin: 0 }}>
                {t("noDescription")}
              </p>
            </section>
          )}
        </div>

        {/* Right Column: Pricing, Primary CTA & Real CMS Contact Card */}
        <div className="car-sidebar-animate" style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <CarContactCard car={car} />
        </div>
      </div>

      {/* Responsive layout styles via embedded CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .car-detail-main-layout {
            grid-template-columns: minmax(0, 1fr) 380px !important;
          }
        }
        @media (min-width: 1280px) {
          .car-detail-main-layout {
            grid-template-columns: minmax(0, 1fr) 420px !important;
            gap: var(--space-3xl) !important;
          }
        }
        @media (max-width: 1023px) {
          .car-contact-card {
            position: static !important;
            margin-top: var(--space-md);
          }
        }
        .cms-contact-action-btn:hover {
          background-color: var(--color-surface-hover) !important;
          border-color: var(--color-secondary) !important;
        }
      `}</style>
    </main>
  );
}

export default CarDetailPage;
