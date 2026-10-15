import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import CarMediaFrame from "../media/CarMediaFrame";
import CinematicImage from "../media/CinematicImage";
import FavoriteButton from "./FavoriteButton";
import VehicleSpecs from "./VehicleSpecs";
import { Eyebrow, Price } from "../ui/Typography";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Icon from "../common/Icon";

/**
 * German Auto — CarCardBase Component
 * Ultra-premium automotive visual language for inventory cards.
 */

export function CarCardBase({
  brand = "Fahrzeugmarke",
  model = "",
  name = "",
  title = "",
  price = 0,
  oldPrice,
  currency = "€",
  vat_eligible,
  vatEligible,
  image,
  thumbnail,
  coverImage,
  media,
  status = "AVAILABLE",
  mileage,
  mileage_km,
  power,
  performance_hp,
  fuel,
  fuel_type,
  transmission,
  registration,
  first_registration,
  condition,
  isFavorite = false,
  onFavoriteToggle,
  onSelect,
  ctaLabel = "Details",
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["cars"]);
  const { isDark } = useTheme?.() || { isDark: true };
  const cardRef = useRef(null);

  const displayName = name || title || model || "";

  const displayImage =
    thumbnail ||
    coverImage ||
    media?.thumbnail ||
    image ||
    media?.gallery?.[0] ||
    null;

  // Status mapping - bright and luminous in dark mode
  const statusBadge = {
    AVAILABLE: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: isDark ? "rgba(4, 47, 23, 0.94)" : "#ecfdf5",
          color: isDark ? "#4ade80" : "#047857",
          border: isDark ? "1.5px solid #22c55e" : "1.5px solid #10b981",
          fontSize: "11px",
          fontWeight: 700,
          backdropFilter: "blur(12px)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: isDark ? "0 0 16px rgba(34, 197, 94, 0.6), 0 2px 8px rgba(0, 0, 0, 0.7)" : "0 2px 6px rgba(0, 0, 0, 0.08)",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: isDark ? "#4ade80" : "#10b981",
            boxShadow: isDark ? "0 0 8px #4ade80" : "none",
          }}
        />
        {t("statusAvailable", "Verfügbar")}
      </span>
    ),
    RESERVED: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: isDark ? "rgba(69, 26, 3, 0.94)" : "#fffbeb",
          color: isDark ? "#fbbf24" : "#b45309",
          border: isDark ? "1.5px solid #f59e0b" : "1.5px solid #f59e0b",
          fontSize: "11px",
          fontWeight: 700,
          backdropFilter: "blur(12px)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: isDark ? "0 0 16px rgba(245, 158, 11, 0.6), 0 2px 8px rgba(0, 0, 0, 0.7)" : "0 2px 6px rgba(0, 0, 0, 0.08)",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: isDark ? "#fbbf24" : "#d97706",
            boxShadow: isDark ? "0 0 8px #fbbf24" : "none",
          }}
        />
        {t("statusReserved", "Reserviert")}
      </span>
    ),
    SOLD: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: isDark ? "rgba(30, 41, 59, 0.94)" : "#f1f5f9",
          color: isDark ? "#f8fafc" : "#475569",
          border: isDark ? "1.5px solid #94a3b8" : "1.5px solid #cbd5e1",
          fontSize: "11px",
          fontWeight: 700,
          backdropFilter: "blur(12px)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: isDark ? "0 2px 8px rgba(0, 0, 0, 0.7)" : "none",
        }}
      >
        {t("statusSold", "Verkauft")}
      </span>
    ),
    HIDDEN: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 12px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.94)" : "#f8fafc",
          color: isDark ? "#94a3b8" : "#64748b",
          border: isDark ? "1.5px solid #475569" : "1.5px solid #e2e8f0",
          fontSize: "11px",
          fontWeight: 700,
          backdropFilter: "blur(12px)",
        }}
      >
        {t("statusHidden", "Nicht öffentlich")}
      </span>
    ),
  }[status] || (status ? <Badge variant="neutral">{status}</Badge> : null);

  return (
    <article
      ref={cardRef}
      onClick={onSelect}
      className={`car-card-base surface-card surface-card-interactive ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        borderRadius: "var(--radius-xl, 16px)",
        background: "var(--card-gradient, var(--color-card))",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
        transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
        cursor: onSelect ? "pointer" : "default",
        touchAction: "pan-y pan-x",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.45)";
        e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Media Stage */}
      <div>
        <CarMediaFrame
          aspectRatio="16-9"
          badge={statusBadge}
          action={
            <FavoriteButton
              size={34}
              isFavorite={isFavorite}
              onToggle={onFavoriteToggle}
              ariaLabel={`${brand} ${displayName}`.trim() + " zu Favoriten hinzufügen"}
            />
          }
        >
          <CinematicImage
            src={displayImage}
            alt={`${brand} ${displayName}`.trim()}
            zoomOnHover
          />
        </CarMediaFrame>
      </div>

      {/* Card Body */}
      <div
        className="car-card-body"
        style={{
          padding: "13px 15px",
          display: "flex",
          flexDirection: "column",
          gap: "9px",
          flex: 1,
        }}
      >
        {/* Title & Brand Header */}
        <div>
          <div
            className="car-card-brand"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-text-muted)",
              marginBottom: "3px",
            }}
          >
            {brand}
          </div>
          <h3
            className="car-card-title"
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--color-text)",
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayName}
          </h3>
        </div>

        {/* Pricing */}
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
          <div
            className="car-card-price"
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            {currency} {typeof price === "number" ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(price || "").replace(/\./g, ",")}
          </div>
          {oldPrice && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-subtle)",
                textDecoration: "line-through",
              }}
            >
              {currency} {typeof oldPrice === "number" ? oldPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(oldPrice || "").replace(/\./g, ",")}
            </div>
          )}
          {(vatEligible ?? vat_eligible) === true && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--color-text-subtle)",
                letterSpacing: "0.02em",
              }}
              title="Mehrwertsteuer ausweisbar"
            >
              (MwSt.)
            </span>
          )}
        </div>

        {/* Specs Chips */}
        <VehicleSpecs
          mileage={mileage ?? mileage_km}
          power={power ?? performance_hp}
          fuel={fuel || fuel_type}
          transmission={transmission}
          registration={registration || first_registration}
          condition={condition}
        />

        {/* CTA Footer */}
        <div style={{ marginTop: "auto", paddingTop: "3px" }}>
          <Button
            variant="outline"
            size="sm"
            iconRight="arrow-right"
            onClick={(e) => {
              if (onSelect) {
                e.stopPropagation();
                onSelect();
              }
            }}
            style={{
              width: "100%",
              height: "34px",
              minHeight: "34px",
              borderRadius: "var(--radius-sm, 6px)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              fontSize: "0.82rem",
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default CarCardBase;
