import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import carsService from "../../services/cars/cars.service";
import { useAuth } from "../../contexts/AuthContext";
import CarCardBase from "../automotive/CarCardBase";
import { Grid } from "../ui/Layout";

/**
 * German Auto — CarRelatedSection Component
 * Displays real vehicles from the backend API excluding the currently viewed car.
 * If no other cars exist in the inventory, the section is gracefully hidden.
 */
export function CarRelatedSection({ currentCarId, currentBrand, className = "", style = {} }) {
  const { t } = useTranslation(["cars", "common"]);
  const navigate = useNavigate();
  const { isCarFavorite, toggleFavorite, isAuthenticated } = useAuth();

  const [relatedCars, setRelatedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRelated() {
      try {
        setLoading(true);
        // Attempt to fetch cars matching brand first, or fallback to general inventory
        const params = { limit: 4 };
        if (currentBrand) {
          params.brand = currentBrand;
        }

        let res = await carsService.getCars(params);
        let list = res?.data?.cars || [];

        // Exclude current vehicle
        let filtered = list.filter((c) => c.id !== currentCarId && c.slug !== currentCarId);

        // If brand filter was too narrow and yielded no cars, fetch general pool
        if (filtered.length === 0 && currentBrand) {
          const generalRes = await carsService.getCars({ limit: 4 });
          const generalList = generalRes?.data?.cars || [];
          filtered = generalList.filter((c) => c.id !== currentCarId && c.slug !== currentCarId);
        }

        if (isMounted) {
          setRelatedCars(filtered.slice(0, 3));
        }
      } catch {
        if (isMounted) {
          setRelatedCars([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (currentCarId) {
      loadRelated();
    }

    return () => {
      isMounted = false;
    };
  }, [currentCarId, currentBrand]);

  if (loading || relatedCars.length === 0) {
    return null;
  }

  const handleFavoriteClick = async (carId) => {
    if (!isAuthenticated) return;
    await toggleFavorite(carId);
  };

  return (
    <section
      className={`car-related-section ${className}`.trim()}
      aria-labelledby="related-vehicles-heading"
      style={{
        marginTop: "var(--space-3xl)",
        paddingTop: "var(--space-2xl)",
        borderTop: "1px solid var(--color-border-subtle)",
        ...style,
      }}
    >
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2
          id="related-vehicles-heading"
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            marginBottom: "var(--space-2xs)",
            color: "var(--color-text)",
          }}
        >
          {t("relatedTitle")}
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", margin: 0 }}>
          {t("relatedSubtitle")}
        </p>
      </div>

      <Grid cols="responsive" gap="lg">
        {relatedCars.map((car) => {
          const identifier = car.slug || car.id;
          const isFav = isCarFavorite(car.id);

          const primaryImage =
            car.media?.thumbnail ||
            car.media?.gallery?.[0] ||
            car.images?.[0] ||
            car.image_url;

          return (
            <CarCardBase
              key={car.id}
              brand={car.brand}
              model={car.model || car.title}
              price={car.price}
              oldPrice={car.old_price}
              status={car.status}
              mileage={car.mileage_km || car.mileage}
              fuel={car.fuel_type}
              transmission={car.transmission}
              registration={car.first_registration || car.registration_year}
              condition={car.condition}
              image={primaryImage}
              isFavorite={isFav}
              onFavoriteToggle={() => handleFavoriteClick(car.id)}
              onSelect={() => navigate(`/cars/${identifier}`)}
              ctaLabel={t("viewDetails", { defaultValue: "Details anzeigen" })}
            />
          );
        })}
      </Grid>
    </section>
  );
}

export default CarRelatedSection;
