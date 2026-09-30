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
  };

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        {/* Section Header */}
        <div
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

        {/* Real Cars Horizontal Scroll Track with Left & Right Arrows flanking the cards */}
        {!loading && !error && cars.length > 0 && (
          <div style={{ position: "relative", width: "100%" }}>
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous cars"
              style={{
                position: "absolute",
                left: "-18px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(18, 20, 24, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(212, 175, 55, 0.4)",
                color: "#D4AF37",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4AF37";
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(18, 20, 24, 0.92)";
                e.currentTarget.style.color = "#D4AF37";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.7)";
              }}
            >
              <Icon name="arrow-left" size={18} />
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next cars"
              style={{
                position: "absolute",
                right: "-18px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(18, 20, 24, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(212, 175, 55, 0.4)",
                color: "#D4AF37",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4AF37";
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(18, 20, 24, 0.92)";
                e.currentTarget.style.color = "#D4AF37";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.7)";
              }}
            >
              <Icon name="arrow-right" size={18} />
            </button>

            <div
              ref={trackRef}
              className="featured-cars-track"
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "var(--space-lg)",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                padding: "8px 2px 24px",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {cars.map((car) => {
                const title = currentLang === "en" ? (car.title_en || car.title) : car.title;
                const mainImage = car.images?.[0] || car.media?.[0]?.url || car.image_url;
                const identifier = car.slug || car.id;
                const isFav = isCarFavorite(car.id);

                return (
                  <div
                    key={car.id}
                    style={{
                      flex: "0 0 clamp(290px, 82vw, 360px)",
                      scrollSnapAlign: "start",
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
