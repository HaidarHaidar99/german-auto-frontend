import React from "react";
import Badge from "../../ui/Badge";

/**
 * SettingsField — Consistent form field wrapper for CMS editors.
 * Features label, localized badge, helper explanation, and validation errors.
 */
export function SettingsField({
  label,
  name,
  htmlFor,
  helper,
  error,
  required = false,
  locale = null, // "de" | "en" | null
  className = "",
  style = {},
  children,
}) {
  const inputId = htmlFor || name;

  return (
    <div
      className={`settings-field ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        marginBottom: "var(--space-md)",
        ...style,
      }}
    >
      {label && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <label
            htmlFor={inputId}
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-admin-text, var(--color-text))",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {label}
            {required && (
              <span
                style={{ color: "var(--color-error, #ef4444)" }}
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          {locale && (
            <Badge
              variant="outline"
              size="sm"
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "1px 6px",
              }}
            >
              {locale}
            </Badge>
          )}
        </div>
      )}

      {children}

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-error, #ef4444)",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}

      {helper && !error && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-admin-muted, var(--color-text-muted))",
            lineHeight: 1.4,
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

export default SettingsField;
