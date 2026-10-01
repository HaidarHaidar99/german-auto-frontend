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
  model = "Modellbezeichnung",
  price = 0,
  oldPrice,
  currency = "€",
  image,
  thumbnail,
  coverImage,
  media,
  status = "AVAILABLE",
  mileage,
  fuel,
  transmission,
  registration,
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
        background: "linear-gradient(180deg, #131518 0%, #0c0d0f 100%)",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "none",
        transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
        cursor: onSelect ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.45)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.09)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Falling Automotive Sparkles & Diamonds Background Animation */}
      <div
        className="car-card-rain-container"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        {[
          { symbol: "✦", left: "8%", size: "16px", dur: "5.5s", delay: "-1.8s", opacity: 0.24 },
          { symbol: "◈", left: "24%", size: "18px", dur: "6.2s", delay: "-4.0s", opacity: 0.22 },
          { symbol: "✧", left: "42%", size: "15px", dur: "4.9s", delay: "-0.5s", opacity: 0.26 },
          { symbol: "⚡", left: "58%", size: "14px", dur: "5.8s", delay: "-3.2s", opacity: 0.20 },
          { symbol: "✦", left: "74%", size: "19px", dur: "4.7s", delay: "-2.3s", opacity: 0.25 },
          { symbol: "◈", left: "88%", size: "17px", dur: "6.4s", delay: "-4.8s", opacity: 0.22 },
        ].map((item, idx) => (
          <span
            key={idx}
            style={{
              position: "absolute",
              top: "-30px",
              left: item.left,
              fontSize: item.size,
              color: "#D4AF37",
              opacity: item.opacity,
              textShadow: "0 0 8px rgba(212, 175, 55, 0.35)",
              animation: `carParticleFall ${item.dur} linear infinite`,
              animationDelay: item.delay,
              willChange: "transform, opacity",
            }}
          >
            {item.symbol}
          </span>
        ))}
      </div>

      {/* Media Stage */}
      <div style={{ position: "relative", zIndex: 1 }}>
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
                ariaLabel={`${brand} ${model} zu Favoriten hinzufügen`}
              />
            </div>
          }
        >
          <CinematicImage
            src={displayImage}
            alt={`${brand} ${model}`}
            zoomOnHover
          />
        </CarMediaFrame>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title & Brand Header */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#94a3b8",
              marginBottom: "4px",
            }}
          >
            {brand}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 700,
              lineHeight: 1.35,
              color: "#ffffff",
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {model}
          </h3>
        </div>

        {/* Pricing */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            {currency} {typeof price === "number" ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(price || "").replace(/\./g, ",")}
          </div>
          {oldPrice && (
            <div
              style={{
                fontSize: "0.9rem",
                color: "#64748b",
                textDecoration: "line-through",
              }}
            >
              {currency} {typeof oldPrice === "number" ? oldPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(oldPrice || "").replace(/\./g, ",")}
            </div>
          )}
        </div>

        {/* Specs Chips */}
        <VehicleSpecs
          mileage={mileage}
          fuel={fuel}
          transmission={transmission}
          registration={registration}
          condition={condition}
        />

        {/* CTA Footer */}
        <div style={{ marginTop: "auto", paddingTop: "var(--space-xs)" }}>
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
              borderRadius: "var(--radius-sm, 6px)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes carParticleFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          15% {
            opacity: 0.3;
          }
          85% {
            opacity: 0.24;
          }
          100% {
            transform: translateY(520px) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </article>
  );
}

export default CarCardBase;
