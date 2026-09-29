import React from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Accessible Icon-Only Button
 */

export function IconButton({
  icon,
  name,
  ariaLabel,
  variant = "secondary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  style = {},
  onClick,
  ...props
}) {
  const resolvedIcon = icon || name;
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-icon-${size}`;
  const iconPixelSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      className={`btn btn-icon ${variantClass} ${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
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
      ) : typeof resolvedIcon === "string" ? (
        <Icon name={resolvedIcon} size={iconPixelSize} />
      ) : (
        resolvedIcon
      )}
    </button>
  );
}

export default IconButton;
