import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "./Icon";

/**
 * German Auto — ThemeToggle Component
 * Compact, accessible, touch-friendly dark/light theme switch.
 * Displays Sun in dark mode (switches to light) and Moon in light mode (switches to dark).
 * Follows current English/German language selection for tooltips and ARIA labels.
 */
export function ThemeToggle({
  size = "desktop", // "desktop" | "mobile"
  className = "",
  style = {},
  onClick,
}) {
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation(["navigation", "common"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const labelText = isDark
    ? (currentLang === "en" ? "Switch to light theme" : "Zu hellem Design wechseln")
    : (currentLang === "en" ? "Switch to dark theme" : "Zu dunklem Design wechseln");

  const handleClick = (e) => {
    toggleTheme();
    if (onClick) {
      onClick(e);
    }
  };

  if (size === "mobile") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={labelText}
        title={labelText}
        className={`theme-toggle theme-toggle-mobile ${className}`.trim()}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "0",
          border: "none",
          backgroundColor: "transparent",
          color: "var(--color-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "color 0.2s ease, transform 0.2s ease",
          flexShrink: 0,
          padding: 0,
          outline: "none",
          boxShadow: "none",
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-secondary, #D4AF37)";
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-text)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Icon
          name={isDark ? "sun" : "moon"}
          size={21}
          color="currentColor"
        />
      </button>
    );
  }

  // Desktop default: compact 38px circular toggle
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={labelText}
      title={labelText}
      className={`theme-toggle theme-toggle-desktop ${className}`.trim()}
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        backgroundColor: "var(--color-accent-subtle)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.25s ease",
        flexShrink: 0,
        padding: 0,
        outline: "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-surface)";
        e.currentTarget.style.borderColor = "var(--color-secondary)";
        e.currentTarget.style.color = "var(--color-secondary)";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.color = "var(--color-text)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Icon
        name={isDark ? "sun" : "moon"}
        size={18}
        color="currentColor"
      />
    </button>
  );
}

export default ThemeToggle;
