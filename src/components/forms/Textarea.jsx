import React, { useId } from "react";

/**
 * German Auto — Premium Form Textarea
 */

export function Textarea({
  label,
  helperText,
  error,
  disabled = false,
  id,
  rows = 4,
  className = "",
  style = {},
  ...props
}) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const isError = Boolean(error);

  return (
    <div className={`form-field ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}

      <div className="form-control-wrap">
        <textarea
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={isError}
          aria-describedby={helperText || error ? `${textareaId}-desc` : undefined}
          className={`form-textarea ${isError ? "is-error" : ""}`.trim()}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <span
          id={`${textareaId}-desc`}
          className={`form-helper ${isError ? "is-error" : ""}`.trim()}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}

export default Textarea;
