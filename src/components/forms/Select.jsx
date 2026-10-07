import React, { useId } from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Form Select Dropdown
 */

export function Select({
  label,
  options = [],
  placeholder = "Bitte wählen...",
  helperText,
  error,
  disabled = false,
  id,
  className = "",
  style = {},
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const isError = Boolean(error);

  return (
    <div className={`form-field ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}

      <div className="form-control-wrap">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={isError}
          aria-describedby={helperText || error ? `${selectId}-desc` : undefined}
          className={`form-select ${isError ? "is-error" : ""}`.trim()}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage: "none",
            paddingRight: "calc(var(--space-md) + 24px)",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          style={{
            position: "absolute",
            right: "var(--space-md)",
            pointerEvents: "none",
            color: "var(--color-text-subtle)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon name="chevron-down" size={16} />
        </span>
      </div>

      {(error || helperText) && (
        <span
          id={`${selectId}-desc`}
          className={`form-helper ${isError ? "is-error" : ""}`.trim()}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}

export default Select;
