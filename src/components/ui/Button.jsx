import React from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Premium Automotive Button Component
 * Controlled micro-transitions, accessibility compliant, touch-friendly.
 */

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  as: Component = "button",
  type = "button",
  className = "",
  style = {},
  onClick,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <Component
      type={Component === "button" ? type : undefined}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      onClick={disabled || loading ? undefined : onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "btn-spin 0.6s linear infinite",
            marginRight: "4px",
          }}
        />
      )}

      {!loading && iconLeft && (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {typeof iconLeft === "string" ? <Icon name={iconLeft} size={size === "sm" ? 14 : 18} /> : iconLeft}
        </span>
      )}

      {children && <span>{children}</span>}

      {!loading && iconRight && (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {typeof iconRight === "string" ? <Icon name={iconRight} size={size === "sm" ? 14 : 18} /> : iconRight}
        </span>
      )}
    </Component>
  );
}

export default Button;
