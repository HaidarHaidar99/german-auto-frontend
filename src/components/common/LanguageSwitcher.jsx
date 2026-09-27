import React from "react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      className={`language-switcher ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        padding: "2px",
        gap: "2px",
      }}
      aria-label="Language selection"
    >
      <button
        onClick={() => toggleLanguage("de")}
        style={{
          padding: "4px 10px",
          minHeight: "32px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: currentLang === "de" ? "var(--color-primary)" : "var(--color-text-secondary)",
          backgroundColor: currentLang === "de" ? "var(--color-secondary)" : "transparent",
          transition: "all var(--transition-fast)",
        }}
        aria-pressed={currentLang === "de"}
      >
        DE
      </button>
      <button
        onClick={() => toggleLanguage("en")}
        style={{
          padding: "4px 10px",
          minHeight: "32px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: currentLang === "en" ? "var(--color-primary)" : "var(--color-text-secondary)",
          backgroundColor: currentLang === "en" ? "var(--color-secondary)" : "transparent",
          transition: "all var(--transition-fast)",
        }}
        aria-pressed={currentLang === "en"}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
