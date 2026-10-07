import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const cardRef = useRef(null);

  const displayName = name || title || model || "";

  const displayImage =
    thumbnail ||
    coverImage ||
    media?.thumbnail ||
    image ||
    media?.gallery?.[0] ||
    null;

  // Status mapping
  const statusBadge = {
    AVAILABLE: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: "rgba(16, 185, 129, 0.18)",
          color: "#34d399",
          border: "1px solid rgba(16, 185, 129, 0.35)",
          fontSize: "11px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34d399" }} />
        {t("statusAvailable", "Verfügbar")}
      </span>
    ),
    RESERVED: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: "rgba(245, 158, 11, 0.18)",
          color: "#fbbf24",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          fontSize: "11px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fbbf24" }} />
        {t("statusReserved", "Reserviert")}
      </span>
    ),
    SOLD: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          color: "#94a3b8",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontSize: "11px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
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
          padding: "4px 10px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          color: "#64748b",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          fontSize: "11px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
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
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
              }}
            >
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={onFavoriteToggle}
                ariaLabel={`${brand} ${displayName}`.trim() + " zu Favoriten hinzufügen"}
              />
            </div>
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
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
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
