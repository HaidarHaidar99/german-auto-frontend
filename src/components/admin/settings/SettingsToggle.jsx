import React, { useId } from "react";

/**
 * SettingsToggle — Accessible toggle switch for enabling/disabling CMS sections & options.
 */
export function SettingsToggle({
  id,
  name,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  style = {},
}) {
  const generatedId = useId();
  const toggleId = id || name || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <div
      className={`settings-toggle ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        padding: "var(--space-sm) 0",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        {label && (
          <label
            htmlFor={toggleId}
            onClick={handleToggle}
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-admin-text, var(--color-text))",
              cursor: disabled ? "not-allowed" : "pointer",
              display: "block",
            }}
          >
            {label}
          </label>
        )}
        {description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-admin-muted, var(--color-text-muted))",
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={label}
        style={{
          position: "relative",
          width: "46px",
          height: "26px",
          borderRadius: "9999px",
          backgroundColor: checked
            ? "var(--color-admin-accent, #2563eb)"
            : "var(--color-admin-surface-muted, rgba(148, 163, 184, 0.3))",
          border: checked
            ? "1px solid var(--color-admin-accent, #2563eb)"
            : "1px solid var(--color-admin-border, rgba(148, 163, 184, 0.4))",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
          padding: 0,
          outline: "none",
          flexShrink: 0,
          boxShadow: checked
            ? "0 0 10px rgba(37, 99, 235, 0.35)"
            : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
            transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </button>
    </div>
  );
}

export default SettingsToggle;
