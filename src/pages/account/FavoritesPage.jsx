import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import carsService from "../../services/cars/cars.service";
import AccountHeader from "../../components/account/AccountHeader";
import AccountNav from "../../components/account/AccountNav";
import AccountEmptyState from "../../components/account/AccountEmptyState";
import CarCardBase from "../../components/automotive/CarCardBase";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import { Grid } from "../../components/ui/Layout";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

let cachedFavoritesCars = null;

export function FavoritesPage() {
  const { t } = useTranslation(["account", "cars", "common"]);
  const { user, isAuthenticated, favorites = [], isCarFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const pageContainerRef = useRef(null);

  const [cars, setCars] = useState(() => cachedFavoritesCars || []);
  const [loading, setLoading] = useState(() => !cachedFavoritesCars);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `${t("favoritesPageTitle")} | German Auto`;
  }, [t]);

  const loadFavorites = React.useCallback(async (silent = false) => {
    try {
      if (!silent && !cachedFavoritesCars) {
        setLoading(true);
      }
      setError(null);

      if (!isAuthenticated) {
        const guestIds = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("german_auto_guest_favorites") || "[]") : [];
        if (guestIds.length === 0) {
          setCars([]);
          cachedFavoritesCars = [];
          setLoading(false);
          return;
        }
        const res = await carsService.getCars({ limit: 100 });
        const allCars = res?.data?.cars || [];
        const filtered = allCars.filter((c) => guestIds.includes(c.id));
        setCars(filtered);
        cachedFavoritesCars = filtered;
      } else {
        if (favorites.length === 0) {
          setCars([]);
          cachedFavoritesCars = [];
          setLoading(false);
          return;
        }
        const res = await carsService.getFavorites();
        const favCars = res?.data?.cars || [];
        setCars(favCars);
        cachedFavoritesCars = favCars;
      }
    } catch (err) {
      if (!cachedFavoritesCars) {
        setError(err?.message || "Fehler beim Laden der Favoriten.");
        setCars([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, favorites.length]);

  useEffect(() => {
    loadFavorites(Boolean(cachedFavoritesCars));
  }, [loadFavorites]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".account-header", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.from(".account-nav", {
      opacity: 0,
      y: 15,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.1,
    });

    gsap.from(".favorites-content-area", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.15,
    });
  });

  const handleFavoriteToggle = async (carId) => {
    await toggleFavorite(carId);
    setCars((prev) => prev.filter((c) => c.id !== carId));
  };

  return (
    <main
      ref={pageContainerRef}
      className="favorites-page"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-md) var(--space-4xl)",
      }}
    >
      <AccountHeader user={user} />
      <AccountNav style={{ marginBottom: "var(--space-2xl)" }} />

      <div className="favorites-content-area">
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 var(--space-2xs) 0",
              color: "var(--color-text)",
            }}
          >
            {t("favoritesPageTitle")}
          </h2>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
            {t("favoritesPageSubtitle")}
          </p>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <Grid cols="responsive" gap="lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--color-card)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-md)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <Skeleton width="100%" height="200px" borderRadius="var(--radius-lg)" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="60%" height="22px" style={{ marginBottom: "var(--space-xs)" }} />
                <Skeleton width="40%" height="16px" style={{ marginBottom: "var(--space-md)" }} />
                <Skeleton width="100%" height="36px" borderRadius="var(--radius-md)" />
              </div>
            ))}
          </Grid>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <ErrorState
            title="Fehler beim Laden"
            message={error}
            onRetry={loadFavorites}
          />
        )}

        {/* 3. Empty State */}
        {!loading && !error && cars.length === 0 && (
          <AccountEmptyState
            icon="heart"
            title={t("noFavoritesTitle")}
            message={t("noFavoritesMessage")}
            actionLabel={t("exploreInventory")}
            actionTo="/cars"
          />
        )}

        {/* 4. Real Favorites Grid */}
        {!loading && !error && cars.length > 0 && (
          <Grid cols="responsive" gap="lg">
            {cars.map((car) => {
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
                  onFavoriteToggle={() => handleFavoriteToggle(car.id)}
                  onSelect={() => navigate(`/cars/${identifier}`)}
                  ctaLabel={t("viewDetails", { ns: "cars" }) || "Details"}
                />
              );
            })}
          </Grid>
        )}
      </div>
    </main>
  );
}

export default FavoritesPage;
