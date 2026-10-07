import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
import Icon from "../common/Icon";
import Skeleton from "../ui/Skeleton";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CarCardBase from "../automotive/CarCardBase";
import ScrollReveal from "../motion/ScrollReveal";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import carsService from "../../services/cars/cars.service";
import AOS from "aos";

/**
 * German Auto — Featured Inventory Section
 * Connects exclusively to real inventory via GET /api/cars?is_featured=true.
 * No fake cars or synthetic inventory placeholders.
 */

export function FeaturedInventorySection() {
  const { t, i18n } = useTranslation(["cars", "common"]);
  const navigate = useNavigate();
  const { isAuthenticated, isCarFavorite, toggleFavorite } = useAuth();
  const { isDark } = useTheme?.() || { isDark: true };
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  const loadFeaturedCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await carsService.getCars({ is_featured: true, limit: 12 });
      const carList = res?.data?.cars || [];
      setCars(carList);
    } catch (err) {
      setError(err?.message || "Fehler beim Laden des Fahrzeugbestands.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedCars();
  }, [loadFeaturedCars]);

  // Responsive cards per view: 3 on desktop (>=1024px), 2 on tablet (>=700px), 1 on mobile (<700px)
  const [visibleCards, setVisibleCards] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 700) return 2;
    return 1;
  });

  const [activeCarIdx, setActiveCarIdx] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newVisible = 1;
      if (width >= 1024) {
        newVisible = 3;
      } else if (width >= 700) {
        newVisible = 2;
      } else {
        newVisible = 1;
      }
      setVisibleCards(newVisible);
      setActiveCarIdx((prev) => {
        const maxIdx = Math.max(0, cars.length - newVisible);
        return Math.min(prev, maxIdx);
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cars.length]);

  useEffect(() => {
    if (cars.length > 0) {
      const timer = setTimeout(() => {
        try { AOS.refresh(); } catch {}
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [cars.length]);

  const maxIndex = Math.max(0, cars.length - visibleCards);
  const canGoLeft = activeCarIdx > 0;
  const canGoRight = activeCarIdx < maxIndex;

  const handlePrevCar = () => {
    setActiveCarIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextCar = () => {
    setActiveCarIdx((prev) => Math.min(maxIndex, prev + 1));
  };

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current < -40 && canGoRight) {
      handleNextCar();
    } else if (touchDeltaX.current > 40 && canGoLeft) {
      handlePrevCar();
    }
    touchDeltaX.current = 0;
  };

  const handleFavoriteClick = async (carId) => {
    await toggleFavorite(carId);
  };

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <div>
            <Heading level={2} style={{ margin: 0, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)" }}>
              {t("featuredSubtitle", "Exklusive Empfehlungen")}
            </Heading>
          </div>

          <div data-aos="fade-up" data-aos-delay="100">
            <Button
              as={Link}
              to="/cars"
              variant="outline"
              size="sm"
              iconRight="arrow-right"
            >
              {t("viewAllCars", "Alle ansehen")}
            </Button>
          </div>
        </div>

        {/* Loading State: Skeletons */}
        {loading && (
          <div style={{ display: "flex", gap: "var(--space-lg)", overflow: "hidden" }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="surface-card"
                style={{ flex: "0 0 340px", padding: "var(--space-md)", borderRadius: "var(--radius-lg)" }}
              >
                <Skeleton width="100%" height="220px" borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="40%" height="16px" style={{ marginBottom: "var(--space-xs)" }} />
                <Skeleton width="70%" height="24px" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="50%" height="28px" style={{ marginBottom: "var(--space-lg)" }} />
                <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry */}
        {!loading && error && (
          <ErrorState
            title="Fahrzeugbestand nicht erreichbar"
            message={error}
            onRetry={loadFeaturedCars}
          />
        )}

        {/* Empty State: Intentional and Premium */}
        {!loading && !error && cars.length === 0 && (
          <EmptyState
            title={t("noFeaturedCars", "Aktuell sind keine hervorgehobenen Fahrzeuge hinterlegt.")}
            message="Unser Portfolio wird fortlaufend aktualisiert. Entdecken Sie alle verfügbaren Modelle in unserer Gesamtübersicht."
            actionLabel={t("viewAllCars", "Gesamten Bestand ansehen")}
            onAction={() => navigate("/cars")}
          />
        )}

        {/* Real Cars Showcase: 3 on desktop, 1 on mobile, equal blank side spaces for arrows */}
        {!loading && !error && cars.length > 0 && (() => {
          const gapPx = visibleCards > 1 ? 20 : 0;
          const cardWidthCss = visibleCards === 1
            ? "100%"
            : `calc((100% - ${(visibleCards - 1) * gapPx}px) / ${visibleCards})`;

          const trackTransform = visibleCards === 1
            ? `translateX(-${activeCarIdx * 100}%)`
            : `translateX(calc(-${activeCarIdx} * ((100% - ${(visibleCards - 1) * gapPx}px) / ${visibleCards} + ${gapPx}px)))`;

          return (
            <div
              className="cars-showcase-container"
              data-aos="fade-right"
              data-aos-duration="750"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: visibleCards > 1 ? "1260px" : "480px",
                margin: "0 auto",
                padding: "10px 0 24px 0",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              {/* Left Blank Space: Arrow appears ONLY if there is a car before */}
              <div
                className="carousel-arrow-slot carousel-arrow-slot-left"
                style={{
                  flex: "0 0 clamp(42px, 5vw, 56px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  height: "100%",
                  minHeight: "44px",
                }}
              >
                {canGoLeft && (
                  <button
                    type="button"
                    onClick={handlePrevCar}
                    aria-label="Previous cars"
                    className="carousel-nav-arrow carousel-nav-arrow-left"
                    style={{
                      width: "38px",
                      height: "38px",
                      minWidth: "38px",
                      minHeight: "38px",
                      padding: 0,
                      margin: 0,
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(18, 20, 24, 0.95)" : "#ffffff",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.28)" : "1px solid rgba(0, 0, 0, 0.16)",
                      color: isDark ? "#ffffff" : "#000000",
                      boxShadow: isDark ? "0 4px 14px rgba(0, 0, 0, 0.45)" : "0 3px 12px rgba(0, 0, 0, 0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      outline: "none",
                      transition: "opacity 0.15s ease",
                      userSelect: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <Icon name="chevron-left" size={18} style={{ pointerEvents: "none" }} />
                  </button>
                )}
              </div>

              {/* Viewport: 3 cars on desktop, only 1 on mobile with 0% peeking */}
              <div
                className="cars-viewport"
                style={{
                  flex: "1 1 auto",
                  maxWidth: visibleCards > 1 ? "100%" : "340px",
                  minWidth: 0,
                  overflow: "hidden",
                  boxSizing: "border-box",
                  borderRadius: "var(--radius-xl, 16px)",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  style={{
                    display: "flex",
                    gap: `${gapPx}px`,
                    width: "100%",
                    transform: trackTransform,
                    transition: "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {cars.map((car) => {
                    const title = currentLang === "en" ? (car.title_en || car.title) : car.title;
                    const mainImage =
                      car.media?.thumbnail ||
                      car.thumbnail ||
                      car.cover_image ||
                      car.images?.[0] ||
                      car.media?.gallery?.[0] ||
                      car.media?.[0]?.url ||
                      car.image_url;
                    const identifier = car.slug || car.id;
                    const isFav = isCarFavorite(car.id);

                    return (
                      <div
                        key={car.id}
                        style={{
                          flex: `0 0 ${cardWidthCss}`,
                          width: cardWidthCss,
                          maxWidth: cardWidthCss,
                          boxSizing: "border-box",
                        }}
                      >
                        <CarCardBase
                          brand={car.brand}
                          name={title || car.name || car.model || car.title}
                          price={car.price}
                          oldPrice={car.old_price}
                          status={car.status}
                          mileage={car.mileage_km ?? car.mileage}
                          power={car.performance_hp ?? car.power}
                          fuel={car.fuel_type || car.fuel}
                          transmission={car.transmission}
                          registration={car.first_registration || car.registration_year}
                          condition={car.condition}
                          image={mainImage}
                          thumbnail={mainImage}
                          isFavorite={isFav}
                          onFavoriteToggle={() => handleFavoriteClick(car.id)}
                          onSelect={() => navigate(`/cars/${identifier}`)}
                          ctaLabel={t("viewDetails", "Details anzeigen")}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Blank Space: Arrow appears ONLY if there is a car after */}
              <div
                className="carousel-arrow-slot carousel-arrow-slot-right"
                style={{
                  flex: "0 0 clamp(42px, 5vw, 56px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  height: "100%",
                  minHeight: "44px",
                }}
              >
                {canGoRight && (
                  <button
                    type="button"
                    onClick={handleNextCar}
                    aria-label="Next cars"
                    className="carousel-nav-arrow carousel-nav-arrow-right"
                    style={{
                      width: "38px",
                      height: "38px",
                      minWidth: "38px",
                      minHeight: "38px",
                      padding: 0,
                      margin: 0,
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(18, 20, 24, 0.95)" : "#ffffff",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.28)" : "1px solid rgba(0, 0, 0, 0.16)",
                      color: isDark ? "#ffffff" : "#000000",
                      boxShadow: isDark ? "0 4px 14px rgba(0, 0, 0, 0.45)" : "0 3px 12px rgba(0, 0, 0, 0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      outline: "none",
                      transition: "opacity 0.15s ease",
                      userSelect: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <Icon name="chevron-right" size={18} style={{ pointerEvents: "none" }} />
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Container>
    </Section>
  );
}

export default FeaturedInventorySection;
