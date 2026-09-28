import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import carsService from "../../services/cars/cars.service";
import CarCardBase from "../automotive/CarCardBase";
import AccountEmptyState from "./AccountEmptyState";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import Icon from "../common/Icon";

export function AccountFavoritesPreview({ className = "", style = {} }) {
  const { t } = useTranslation(["account", "cars", "common"]);
  const { isCarFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const res = await carsService.getFavorites();
        if (isMounted) {
          const list = res?.data?.cars || [];
          setCars(list);
        }
      } catch {
        if (isMounted) {
          setCars([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFavoriteClick = async (carId) => {
    await toggleFavorite(carId);
    setCars((prev) => prev.filter((c) => c.id !== carId));
  };

  const previewCars = cars.slice(0, 3);

  return (
    <section
      className={`account-favorites-preview ${className}`.trim()}
      aria-labelledby="favorites-preview-heading"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
            <Icon name="heart" size={18} color="var(--color-secondary)" />
            <h2
              id="favorites-preview-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "var(--tracking-tight)",
                margin: 0,
                color: "var(--color-text)",
              }}
            >
              {t("favoritesPreviewTitle")}
            </h2>
          </div>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            {t("favoritesPreviewSubtitle")}
          </p>
        </div>

        {cars.length > 0 && (
          <Button as={Link} to="/account/favorites" variant="outline" size="sm" iconRight="arrow-right">
            {t("viewAllFavorites")} ({cars.length})
          </Button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-md)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <Skeleton width="100%" height="180px" borderRadius="var(--radius-lg)" style={{ marginBottom: "var(--space-md)" }} />
              <Skeleton width="60%" height="20px" style={{ marginBottom: "var(--space-xs)" }} />
              <Skeleton width="40%" height="16px" />
            </div>
          ))}
        </div>
      ) : previewCars.length === 0 ? (
        <AccountEmptyState
          icon="heart"
          title={t("noFavoritesTitle")}
          message={t("noFavoritesMessage")}
          actionLabel={t("exploreInventory")}
          actionTo="/cars"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {previewCars.map((car) => {
            const identifier = car.slug || car.id;
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
                isFavorite={isCarFavorite(car.id)}
                onFavoriteToggle={() => handleFavoriteClick(car.id)}
                onSelect={() => navigate(`/cars/${identifier}`)}
                ctaLabel={t("viewDetails", { ns: "cars" }) || "Details"}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AccountFavoritesPreview;
