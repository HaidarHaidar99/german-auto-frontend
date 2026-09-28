import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import carsService from "../../services/cars/cars.service";
import CarMediaGallery from "../../components/car-detail/CarMediaGallery";
import CarTechnicalSpecs from "../../components/car-detail/CarTechnicalSpecs";
import CarEquipment from "../../components/car-detail/CarEquipment";
import CarContactCard from "../../components/car-detail/CarContactCard";
import CarRelatedSection from "../../components/car-detail/CarRelatedSection";
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
  const { t, i18n } = useTranslation(["cars", "common"]);
  const { settings } = useSettings();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [fetchCar]);

  // Dynamic SEO metadata updates
  useEffect(() => {
    if (!car) return;
    const siteName = settings?.site?.name || "German Auto";
    const carTitle = `${car.brand || ""} ${car.model || ""} ${car.title || ""}`.trim();
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
          padding: "var(--space-2xl) var(--space-md)",
          maxWidth: "1400px",
          margin: "0 auto",
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
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-md) var(--space-4xl)",
      }}
    >
      {/* ─── Breadcrumb & Navigation Bar ───────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          marginBottom: "var(--space-lg)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <Link
          to="/cars"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2xs)",
            color: "var(--color-secondary)",
            textDecoration: "none",
            transition: "color var(--duration-fast) var(--ease-smooth)",
          }}
        >
          <Icon name="arrow-left" size={16} />
          <span>{t("backToInventory")}</span>
        </Link>
        <span style={{ color: "var(--color-text-subtle)" }}>/</span>
        <span style={{ color: "var(--color-text-muted)" }}>{car.brand}</span>
        <span style={{ color: "var(--color-text-subtle)" }}>/</span>
        <span style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-medium)" }}>
          {car.model || car.title}
        </span>
      </nav>

      {/* ─── Vehicle Header ────────────────────────────────────────────── */}
      <header className="car-header-animate" style={{ marginBottom: "var(--space-xl)" }}>
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
            margin: "0 0 var(--space-2xs) 0",
            color: "var(--color-text)",
          }}
        >
          {car.model}
          {car.title && car.title !== car.model ? ` — ${car.title}` : ""}
        </h1>
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
        }}
      >
        {/* Left Column: Media Stage, Specs, Description & Equipment */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
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
        <div className="car-sidebar-animate">
          <CarContactCard car={car} />
        </div>
      </div>

      {/* ─── Real Related Vehicles Section ─────────────────────────────── */}
      <CarRelatedSection currentCarId={car.id} currentBrand={car.brand} />

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
