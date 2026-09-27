import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Layout";
import { Eyebrow, Display, Text, Price } from "../ui/Typography";
import Button from "../ui/Button";
import VehicleSpecs from "../automotive/VehicleSpecs";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Cinematic Vehicle Showcase Section
 * Demonstrates the signature automotive interaction using real database car media.
 * Desktop uses layered depth and progressive specification reveal;
 * Mobile uses a clean, vertical touch-friendly composition without pinned scroll.
 */

export function AutomotiveShowcaseSection({ car }) {
  const { t } = useTranslation(["common", "cars"]);
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !sectionRef.current || !mediaRef.current || !contentRef.current) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // Clean vertical composition for mobile

    const section = sectionRef.current;
    const media = mediaRef.current;
    const content = contentRef.current;

    const ctx = gsap.context(() => {
      // Subtle depth shift between foreground content and background stage
      gsap.fromTo(
        media,
        { scale: 1.08, y: -20 },
        {
          scale: 1,
          y: 20,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        content,
        { y: 30, opacity: 0.8 },
        {
          y: -20,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [car]);

  if (!car) {
    return null;
  }

  const mainImage = car.images?.[0] || car.media?.[0]?.url || car.image_url;
  const identifier = car.slug || car.id;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "clamp(520px, 80vh, 840px)",
        width: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Background Media Stage Layer */}
      {mainImage && (
        <div
          ref={mediaRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={mainImage}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.65)",
            }}
          />
        </div>
      )}

      {/* Atmospheric Radial Gradient Floor & Dark Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9, 10, 12, 0.75) 0%, rgba(9, 10, 12, 0.5) 40%, rgba(9, 10, 12, 0.95) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Foreground Content */}
      <Container size="default" style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <div
          ref={contentRef}
          style={{
            maxWidth: "680px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            padding: "var(--space-2xl) 0",
          }}
        >
          <Eyebrow>{car.brand} // Spotlight</Eyebrow>

          <Display size="xl" style={{ margin: 0 }}>
            {car.model || car.title}
          </Display>

          {car.description_de && (
            <Text variant="lead" style={{ margin: 0, maxWidth: "540px" }}>
              {car.description_de}
            </Text>
          )}

          {/* Pricing */}
          <div style={{ marginTop: "var(--space-xs)" }}>
            <Price value={car.price} oldPrice={car.old_price} size="lg" />
          </div>

          {/* Key Specs Chips */}
          <div style={{ marginTop: "var(--space-xs)" }}>
            <VehicleSpecs
              mileage={car.mileage}
              fuel={car.fuel_type}
              transmission={car.transmission}
              registration={car.registration_year}
              condition={car.condition}
            />
          </div>

          {/* CTA Button */}
          <div style={{ marginTop: "var(--space-md)" }}>
            <Button
              as={Link}
              to={`/cars/${identifier}`}
              variant="primary"
              size="lg"
              iconRight="arrow-right"
            >
              {t("cars:details", "Fahrzeugdetails ansehen")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default AutomotiveShowcaseSection;
