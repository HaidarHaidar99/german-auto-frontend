import React from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Automotive Status & Feature Badge
 */

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  icon,
  className = "",
  style = {},
  ...props
}) {
  const variantClass = `badge-${variant}`;
  const isSm = size === "sm";

  return (
    <span
      className={`badge ${variantClass} ${className}`.trim()}
      style={{
        fontSize: isSm ? "var(--font-size-2xs)" : "var(--font-size-xs)",
        padding: isSm ? "2px 6px" : "4px 8px",
        ...style,
      }}
      {...props}
    >
      {icon && (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {typeof icon === "string" ? <Icon name={icon} size={isSm ? 10 : 12} /> : icon}
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
