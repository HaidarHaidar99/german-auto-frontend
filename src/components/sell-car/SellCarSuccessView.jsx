import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Icon from "../common/Icon";

/**
 * German Auto — SellCarSuccessView Component
 * Luxury confirmation presentation following successful vehicle valuation submission.
 */
export function SellCarSuccessView({ submissionId, onReset, className = "", style = {} }) {
  const { t } = useTranslation(["forms", "common"]);

  return (
    <section
      className={`sell-car-success-view ${className}`.trim()}
      aria-live="polite"
      style={{
        maxWidth: "680px",
        margin: "var(--space-2xl) auto",
        padding: "var(--space-3xl) var(--space-xl)",
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-elevation-3)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-lg)",
        ...style,
      }}
    >
      {/* Halo Checkmark Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          border: "2px solid #10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
        }}
      >
        <Icon name="check" size={36} />
      </div>

      <div>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-xs) 0",
            color: "var(--color-text)",
          }}
        >
          {t("successTitle")}
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-base)",
            lineHeight: "var(--line-height-relaxed)",
            color: "var(--color-text-secondary)",
            margin: 0,
            maxWidth: "540px",
          }}
        >
          {t("successMessage")}
        </p>
      </div>

      {/* Submission Reference ID */}
      {submissionId && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            padding: "var(--space-xs) var(--space-md)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border-subtle)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>{t("submissionIdLabel")}:</span>
          <code
            style={{
              color: "var(--color-secondary)",
              fontWeight: "var(--font-weight-semibold)",
              fontFamily: "var(--font-family-mono, monospace)",
            }}
          >
            {submissionId}
          </code>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
          justifyContent: "center",
          marginTop: "var(--space-md)",
          width: "100%",
        }}
      >
        <Button variant="primary" onClick={onReset} iconLeft="plus">
          {t("newSubmission")}
        </Button>
        <Button as={Link} to="/cars" variant="secondary" iconLeft="grid">
          {t("backToInventory")}
        </Button>
        <Button as={Link} to="/" variant="ghost" iconLeft="home">
          {t("backToHome")}
        </Button>
      </div>
    </section>
  );
}

export default SellCarSuccessView;
