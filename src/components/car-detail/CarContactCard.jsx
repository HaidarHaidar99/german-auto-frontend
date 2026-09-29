import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import FavoriteButton from "../automotive/FavoriteButton";
import Icon from "../common/Icon";

/**
 * German Auto — CarContactCard Component
 * Sticky sidebar card presenting pricing, status, favorite toggle, primary inquiry CTA,
 * and direct contact actions loaded strictly from real CMS settings.
 */
export function CarContactCard({ car, className = "", style = {} }) {
  const { t, i18n } = useTranslation(["cars", "common"]);
  const { settings } = useSettings();
  const { isCarFavorite, toggleFavorite, isAuthenticated } = useAuth();
  const [favoriteNotice, setFavoriteNotice] = useState(false);

  const contact = settings?.contact || {};
  const phone = contact.phone ? String(contact.phone).trim() : null;
  const whatsapp = contact.whatsapp ? String(contact.whatsapp).trim() : null;
  const email = contact.email ? String(contact.email).trim() : null;

  const locale = i18n.language === "de" ? "de-DE" : "en-US";
  const currencyFmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const priceNum = typeof car?.price === "number" ? car.price : Number(car?.price) || 0;
  const oldPriceNum = typeof car?.old_price === "number" ? car.old_price : Number(car?.old_price) || 0;
  const hasDiscount = oldPriceNum > priceNum && priceNum > 0;

  // Status mapping
  const statusBadge = {
    AVAILABLE: <Badge variant="success">{t("statusAvailable", { defaultValue: "Verfügbar" })}</Badge>,
    RESERVED: <Badge variant="warning">{t("statusReserved", { defaultValue: "Reserviert" })}</Badge>,
    SOLD: <Badge variant="neutral">{t("statusSold", { defaultValue: "Verkauft" })}</Badge>,
    HIDDEN: <Badge variant="neutral">{t("statusHidden", { defaultValue: "Nicht öffentlich" })}</Badge>,
  }[car?.status] || (car?.status ? <Badge variant="neutral">{car.status}</Badge> : null);

  const carTitle = `${car?.brand || ""} ${car?.model || ""} ${car?.title || ""}`.trim();
  const inquiryLink = `/contact?car=${encodeURIComponent(carTitle || "Fahrzeuganfrage")}`;

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setFavoriteNotice(true);
      setTimeout(() => setFavoriteNotice(false), 4000);
      return;
    }
    await toggleFavorite(car?.id);
  };

  // WhatsApp clean link builder
  const whatsappCleanNumber = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : "";
  const whatsappMessage = encodeURIComponent(
    `Guten Tag, ich interessiere mich für das Fahrzeug ${carTitle}. Bitte senden Sie mir weitere Details.`
  );
  const whatsappUrl = whatsappCleanNumber
    ? `https://wa.me/${whatsappCleanNumber}?text=${whatsappMessage}`
    : null;

  return (
    <aside
      className={`car-contact-card ${className}`.trim()}
      aria-label={t("contactDealer")}
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-xl)",
        boxShadow: "var(--shadow-elevation-2)",
        position: "sticky",
        top: "100px",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        ...style,
      }}
    >
      {/* Status & Favorite Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {statusBadge}
          {car?.condition && (
            <Badge variant="outline">
              {t(`cond_${car.condition}`, { defaultValue: car.condition })}
            </Badge>
          )}
        </div>

        <FavoriteButton
          isFavorite={isCarFavorite(car?.id)}
          onToggle={handleToggleFavorite}
          ariaLabel={t("loginToFavorite")}
        />
      </div>

      {/* Favorite Auth Warning Toast */}
      {favoriteNotice && (
        <div
          role="alert"
          style={{
            padding: "var(--space-xs) var(--space-sm)",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid var(--color-secondary)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-secondary)",
            textAlign: "center",
          }}
        >
          {t("loginToFavorite")}
        </div>
      )}

      {/* Price Presentation */}
      <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-lg)" }}>
        {hasDiscount && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              marginBottom: "var(--space-2xs)",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-subtle)",
                textDecoration: "line-through",
              }}
            >
              {currencyFmt.format(oldPriceNum)}
            </span>
            <span
              style={{
                fontSize: "var(--font-size-2xs)",
                fontWeight: "var(--font-weight-bold)",
                color: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                padding: "2px 6px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              - {currencyFmt.format(oldPriceNum - priceNum)}
            </span>
          </div>
        )}

        <div
          style={{
            fontSize: "var(--font-size-3xl)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--color-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currencyFmt.format(priceNum)}
        </div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)", marginTop: "var(--space-3xs)" }}>
          inkl. MwSt. / Bruttopreis
        </div>
      </div>

      {/* Primary Action Button */}
      <div>
        <Button
          as={Link}
          to={inquiryLink}
          variant="primary"
          size="lg"
          fullWidth
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-xs)",
            textAlign: "center",
          }}
        >
          <Icon name="mail" size={18} />
          <span>{t("inquireNow")}</span>
        </Button>
      </div>

      {/* Real CMS Direct Contact Channels (Rendered ONLY if populated in Settings) */}
      {(phone || whatsapp || email) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xs)",
            paddingTop: "var(--space-sm)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wider)",
              color: "var(--color-text-subtle)",
              marginBottom: "var(--space-2xs)",
            }}
          >
            {t("contactDealer")}
          </div>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="cms-contact-action-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text)",
                fontSize: "var(--font-size-sm)",
                textDecoration: "none",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="phone" size={16} color="var(--color-secondary)" />
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>{phone}</span>
            </a>
          )}

          {whatsapp && whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cms-contact-action-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text)",
                fontSize: "var(--font-size-sm)",
                textDecoration: "none",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="message-square" size={16} color="#25D366" />
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>WhatsApp</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(`Anfrage: ${carTitle}`)}`}
              className="cms-contact-action-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text)",
                fontSize: "var(--font-size-sm)",
                textDecoration: "none",
                transition: "all var(--duration-fast) var(--ease-smooth)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Icon name="mail" size={16} color="var(--color-secondary)" />
              <span style={{ fontWeight: "var(--font-weight-medium)", overflow: "hidden", textOverflow: "ellipsis" }}>
                {email}
              </span>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}

export default CarContactCard;
