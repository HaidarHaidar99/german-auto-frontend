import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import CarMediaFrame from "../media/CarMediaFrame";
import CinematicImage from "../media/CinematicImage";
import FavoriteButton from "./FavoriteButton";
import VehicleSpecs from "./VehicleSpecs";
import { Eyebrow, Price } from "../ui/Typography";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

/**
 * German Auto — CarCardBase Component
 * Reusable automotive visual language for inventory cards.
 * Uses neutral dev placeholders by default.
 */

export function CarCardBase({
  brand = "Fahrzeugmarke",
  model = "Modellbezeichnung",
  price = 0,
  oldPrice,
  currency = "€",
  image,
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

  // Status mapping
  const statusBadge = {
    AVAILABLE: <Badge variant="success">{t("statusAvailable", "Verfügbar")}</Badge>,
    RESERVED: <Badge variant="warning">{t("statusReserved", "Reserviert")}</Badge>,
    SOLD: <Badge variant="neutral">{t("statusSold", "Verkauft")}</Badge>,
    HIDDEN: <Badge variant="neutral">{t("statusHidden", "Nicht öffentlich")}</Badge>,
  }[status] || (status ? <Badge variant="neutral">{status}</Badge> : null);

  // Directional 3D tilt on desktop hover
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`car-card-base surface-card surface-card-interactive ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "transform var(--duration-normal) var(--ease-smooth), box-shadow var(--duration-normal) var(--ease-smooth), border-color var(--duration-normal) var(--ease-smooth)",
        ...style,
      }}
    >
      {/* Media Stage */}
      <CarMediaFrame
        aspectRatio="16-9"
        badge={statusBadge}
        action={
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onFavoriteToggle}
            ariaLabel={`${brand} ${model} zu Favoriten hinzufügen`}
          />
        }
      >
        <CinematicImage
          src={image}
          alt={`${brand} ${model}`}
          zoomOnHover
        />
      </CarMediaFrame>

      {/* Card Body */}
      <div
        style={{
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          flex: 1,
        }}
      >
        {/* Title & Brand Header */}
        <div>
          <Eyebrow style={{ marginBottom: "2px" }}>{brand}</Eyebrow>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-bold)",
              lineHeight: "var(--leading-snug)",
              color: "var(--color-text)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {model}
          </h3>
        </div>

        {/* Pricing */}
        <div>
          <Price value={price} oldPrice={oldPrice} currency={currency} size="md" />
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
            onClick={onSelect}
            style={{ width: "100%" }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default CarCardBase;
