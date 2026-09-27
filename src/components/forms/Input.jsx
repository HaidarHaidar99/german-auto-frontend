import React, { useId } from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Premium Automotive Form Input
 */

export function Input({
  label,
  helperText,
  error,
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  success = false,
  id,
  type = "text",
  className = "",
  style = {},
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isError = Boolean(error);

  return (
    <div className={`form-field ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}

      <div className="form-control-wrap">
        {startIcon && (
          <span
            style={{
              position: "absolute",
              left: "var(--space-md)",
              color: isError ? "var(--color-error)" : "var(--color-text-subtle)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {typeof startIcon === "string" ? <Icon name={startIcon} size={18} /> : startIcon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={isError}
          aria-describedby={helperText || error ? `${inputId}-desc` : undefined}
          className={`form-input ${isError ? "is-error" : ""}`.trim()}
          style={{
            paddingLeft: startIcon ? "calc(var(--space-md) + 24px)" : "var(--space-md)",
            paddingRight: endIcon || loading || success ? "calc(var(--space-md) + 24px)" : "var(--space-md)",
          }}
          {...props}
        />

        {(endIcon || loading || success) && (
          <span
            style={{
              position: "absolute",
              right: "var(--space-md)",
              color: isError
                ? "var(--color-error)"
                : success
                ? "var(--color-success)"
                : "var(--color-text-subtle)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {loading ? (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "btn-spin 0.6s linear infinite",
                }}
              />
            ) : success ? (
              <Icon name="check" size={18} />
            ) : typeof endIcon === "string" ? (
              <Icon name={endIcon} size={18} />
            ) : (
              endIcon
            )}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <span
          id={`${inputId}-desc`}
          className={`form-helper ${isError ? "is-error" : ""}`.trim()}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}

export default Input;
