import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

/**
 * German Auto — SellCarProcessHeader Component
 * Editorial hero section presenting service headline, CMS description,
 * and a 4-step automotive pipeline indicator.
 */
export function SellCarProcessHeader({ title, subtitle, mediaUrl, className = "", style = {} }) {
  const { t } = useTranslation(["forms", "common"]);

  const steps = [
    { icon: "car", label: t("stepVehicle") },
    { icon: "sliders", label: t("stepDetails") },
    { icon: "camera", label: t("stepImages") },
    { icon: "send", label: t("stepContact") },
  ];

  return (
    <header
      className={`sell-car-header ${className}`.trim()}
      style={{
        position: "relative",
        padding: "var(--space-2xl) 0 var(--space-xl)",
        marginBottom: "var(--space-2xl)",
        ...style,
      }}
    >
      {/* Background Ambient Glow or Media Image if CMS provides media_url */}
      {mediaUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${mediaUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            borderRadius: "var(--radius-xl)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
          <Badge variant="secondary" size="md">
            {t("sellCarBadge")}
          </Badge>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.15,
            color: "var(--color-text)",
            margin: "0 0 var(--space-md) 0",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: "var(--font-size-base)",
            lineHeight: "var(--line-height-relaxed)",
            color: "var(--color-text-secondary)",
            margin: "0 0 var(--space-2xl) 0",
          }}
        >
          {subtitle}
        </p>

      </div>
    </header>
  );
}

export default SellCarProcessHeader;
