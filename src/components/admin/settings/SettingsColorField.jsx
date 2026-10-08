import React from "react";
import SettingsField from "./SettingsField";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * SettingsColorField — Dedicated Hex Color editor with live swatch preview.
 */
export function SettingsColorField({
  label,
  name,
  value = "#000000",
  onChange,
  helper,
  error,
  required = false,
  className = "",
}) {
  const safeValue = typeof value === "string" && value.startsWith("#") ? value : `#${value || "000000"}`;

  const handleHexTextChange = (e) => {
    let input = e.target.value.trim();
    if (!input.startsWith("#") && input.length > 0) {
      input = `#${input}`;
    }
    onChange?.(input);
  };

  const handleColorPickerChange = (e) => {
    onChange?.(e.target.value);
  };

  const isValidHex = HEX_COLOR_REGEX.test(safeValue);

  return (
    <SettingsField
      label={label}
      name={name}
      helper={helper}
      error={error || (!isValidHex && safeValue.length > 1 ? "Ungültiger Hex-Code (#RGB oder #RRGGBB)" : null)}
      required={required}
      className={className}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
        }}
      >
        {/* Native Color Picker Swatch */}
        <div
          style={{
            position: "relative",
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-sm, 6px)",
            border: "1px solid var(--color-admin-border, #cbd5e1)",
            overflow: "hidden",
            flexShrink: 0,
            cursor: "pointer",
            background: isValidHex ? safeValue : "#000",
          }}
        >
          <input
            type="color"
            value={isValidHex && safeValue.length === 7 ? safeValue : "#000000"}
            onChange={handleColorPickerChange}
            aria-label={`${label} color picker`}
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              cursor: "pointer",
              opacity: 0,
              padding: 0,
              margin: 0,
            }}
          />
        </div>

        {/* Hex Text Input */}
        <input
          type="text"
          id={name}
          name={name}
          value={value || ""}
          onChange={handleHexTextChange}
          placeholder="#000000"
          maxLength={7}
          style={{
            flex: 1,
            height: "42px",
            padding: "0 var(--space-md)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "monospace",
            backgroundColor: "var(--color-admin-pill-bg, rgba(0, 0, 0, 0.03))",
            border: `1px solid ${
              error || (!isValidHex && safeValue.length > 1)
                ? "var(--color-error, #ef4444)"
                : "var(--color-admin-border, #cbd5e1)"
            }`,
            borderRadius: "var(--radius-sm, 6px)",
            color: "var(--color-admin-text, #0f172a)",
            letterSpacing: "0.08em",
            outline: "none",
          }}
        />
      </div>
    </SettingsField>
  );
}

export default SettingsColorField;
