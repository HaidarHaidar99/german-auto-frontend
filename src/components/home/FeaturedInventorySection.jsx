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
      const res = await carsService.getCars({ is_featured: true, limit: 3 });
      const carList = (res?.data?.cars || []).slice(0, 3);
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

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, cars]);

  const handleFavoriteClick = async (carId) => {
    await toggleFavorite(carId);
  };

  const scrollTargetRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const handleScroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;

    // Dynamically calculate one card step (width + gap)
    const firstItem = track.querySelector(".featured-car-item") || track.firstElementChild;
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 300;
    const gap = 18;
    const step = itemWidth + gap;

    const currentScroll = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;

    // Stack rapid clicks seamlessly without lag
    let target = scrollTargetRef.current !== null ? scrollTargetRef.current : currentScroll;
    if (dir === "left") {
      target = Math.max(0, target - step);
    } else {
      target = Math.min(maxScroll, target + step);
    }
    scrollTargetRef.current = target;

    // Fast 150ms cubic ease-out: starts immediately with maximum velocity
    const startTime = performance.now();
    const startPos = track.scrollLeft;
    const distance = target - startPos;
    const duration = 150;

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      track.scrollLeft = startPos + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        track.scrollLeft = scrollTargetRef.current !== null ? scrollTargetRef.current : target;
        scrollTargetRef.current = null;
        isAnimatingRef.current = false;
        updateScrollState();
      }
    };

    requestAnimationFrame(animate);
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

        {/* Real Cars Carousel starting from the beginning of the page */}
        {!loading && !error && cars.length > 0 && (
          <div
            style={{
              position: "relative",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <style>{`
              @media (max-width: 640px) {
                .featured-cars-track {
                  scroll-snap-type: x mandatory !important;
                  padding-left: calc((100% - 280px) / 2) !important;
                  padding-right: calc((100% - 280px) / 2) !important;
                  gap: 16px !important;
                }
                .featured-car-item {
                  flex: 0 0 280px !important;
                  width: 280px !important;
                  max-width: 280px !important;
                  scroll-snap-align: center !important;
                }
                .carousel-nav-arrow {
                  width: 34px !important;
                  height: 34px !important;
                  min-width: 34px !important;
                  min-height: 34px !important;
                }
                .carousel-nav-arrow-left {
                  left: 4px !important;
                }
                .carousel-nav-arrow-right {
                  right: 4px !important;
                }
              }
              @media (max-width: 330px) {
                .featured-cars-track {
                  padding-left: calc((100% - 245px) / 2) !important;
                  padding-right: calc((100% - 245px) / 2) !important;
                }
                .featured-car-item {
                  flex: 0 0 245px !important;
                  width: 245px !important;
                  max-width: 245px !important;
                }
              }
            `}</style>

            {/* Left Arrow Button - ONLY visible if not on first car card */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll("left")}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Previous cars"
                className="carousel-nav-arrow carousel-nav-arrow-left"
                style={{
                  position: "absolute",
                  left: "6px",
                  top: "46%",
                  transform: "translateY(-50%)",
                  zIndex: 25,
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  minHeight: "40px",
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: isDark ? "rgba(18, 20, 24, 0.95)" : "#ffffff",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(0, 0, 0, 0.16)",
                  color: isDark ? "#ffffff" : "#000000",
                  boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "0 3px 12px rgba(0, 0, 0, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  transition: "opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <Icon name="chevron-left" size={20} style={{ pointerEvents: "none" }} />
              </button>
            )}

            {/* Right Arrow Button - ONLY visible if can scroll right */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll("right")}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Next cars"
                className="carousel-nav-arrow carousel-nav-arrow-right"
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "46%",
                  transform: "translateY(-50%)",
                  zIndex: 25,
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  minHeight: "40px",
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: isDark ? "rgba(18, 20, 24, 0.95)" : "#ffffff",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(0, 0, 0, 0.16)",
                  color: isDark ? "#ffffff" : "#000000",
                  boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "0 3px 12px rgba(0, 0, 0, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  transition: "opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <Icon name="chevron-right" size={20} style={{ pointerEvents: "none" }} />
              </button>
            )}

            <div
              ref={trackRef}
              className="featured-cars-track"
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "18px",
                overflowX: "auto",
                scrollSnapType: "none",
                padding: "8px 0 20px 0",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                width: "100%",
                boxSizing: "border-box",
                justifyContent: "flex-start",
                touchAction: "pan-y pan-x",
                overscrollBehaviorX: "contain",
                overscrollBehaviorY: "auto",
              }}
            >
              {cars.map((car, idx) => {
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
                    className="featured-car-item"
                    style={{
                      flex: "0 0 clamp(245px, 75vw, 310px)",
                      maxWidth: "310px",
                      margin: "0",
                      boxSizing: "border-box",
                      touchAction: "pan-y pan-x",
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
        )}
      </Container>
    </Section>
  );
}

export default FeaturedInventorySection;
