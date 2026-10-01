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

  const handleScroll = (dir) => {
    if (!trackRef.current) return;
    const scrollAmount = 370;
    trackRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
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
            {/* Left Arrow Button - ONLY visible if not on first car card */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous cars"
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "46%",
                  transform: "translateY(-50%)",
                  zIndex: 25,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(18, 20, 24, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
              >
                <Icon name="chevron-left" size={18} />
              </button>
            )}

            {/* Right Arrow Button - ONLY visible if can scroll right */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next cars"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "46%",
                  transform: "translateY(-50%)",
                  zIndex: 25,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(18, 20, 24, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
              >
                <Icon name="chevron-right" size={18} />
              </button>
            )}

            <div
              ref={trackRef}
              className="featured-cars-track"
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "24px",
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
                      flex: "0 0 clamp(290px, 85vw, 360px)",
                      maxWidth: "360px",
                      margin: "0",
                      boxSizing: "border-box",
                      touchAction: "pan-y pan-x",
                    }}
                  >
                    <CarCardBase
                      brand={car.brand}
                      model={car.model || title}
                      price={car.price}
                      oldPrice={car.old_price}
                      status={car.status}
                      mileage={car.mileage}
                      fuel={car.fuel_type}
                      transmission={car.transmission}
                      registration={car.registration_year || car.first_registration}
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
