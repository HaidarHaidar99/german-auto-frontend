import React, { useId } from "react";

/**
 * German Auto — Accessible Checkbox
 */

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  id,
  className = "",
  style = {},
  ...props
}) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className={`form-field ${className}`.trim()} style={style}>
      <label htmlFor={checkboxId} className="form-checkbox-label">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-checkbox"
          {...props}
        />
        <span>{label}</span>
      </label>

      {error && (
        <span className="form-helper is-error" style={{ marginLeft: "28px" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Checkbox;
