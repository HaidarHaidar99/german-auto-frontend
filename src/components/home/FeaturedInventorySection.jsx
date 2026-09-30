import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
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

  const loadFeaturedCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await carsService.getCars({ is_featured: true, limit: 6 });
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

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <div>
            <Eyebrow>{t("featuredTitle", "Ausgewählte Fahrzeuge")}</Eyebrow>
            <Heading level={2} style={{ margin: 0 }}>
              {t("featuredSubtitle", "Exklusive Empfehlungen aus unserem aktuellen Bestand")}
            </Heading>
          </div>

          <Button
            as={Link}
            to="/cars"
            variant="outline"
            size="md"
            iconRight="arrow-right"
          >
            {t("viewAllCars", "Gesamten Bestand ansehen")}
          </Button>
        </div>

        {/* Loading State: Skeletons */}
        {loading && (
          <Grid cols="responsive" gap="lg">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="surface-card"
                style={{ padding: "var(--space-md)", borderRadius: "var(--radius-lg)" }}
              >
                <Skeleton width="100%" height="220px" borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="40%" height="16px" style={{ marginBottom: "var(--space-xs)" }} />
                <Skeleton width="70%" height="24px" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="50%" height="28px" style={{ marginBottom: "var(--space-lg)" }} />
                <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
              </div>
            ))}
          </Grid>
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

        {/* Real Cars Grid */}
        {!loading && !error && cars.length > 0 && (
          <ScrollReveal stagger={0.08}>
            <Grid cols="responsive" gap="lg">
              {cars.map((car) => {
                const title = currentLang === "en" ? (car.title_en || car.title) : car.title;
                const mainImage = car.images?.[0] || car.media?.[0]?.url || car.image_url;
                const identifier = car.slug || car.id;
                const isFav = isCarFavorite(car.id);

                return (
                  <CarCardBase
                    key={car.id}
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
                );
              })}
            </Grid>
          </ScrollReveal>
        )}
      </Container>
    </Section>
  );
}

export default FeaturedInventorySection;
