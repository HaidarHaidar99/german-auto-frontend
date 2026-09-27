import React from "react";

/**
 * German Auto — Hairline Divider
 */

export function Divider({
  orientation = "horizontal",
  spacing = "md",
  label,
  className = "",
  style = {},
  ...props
}) {
  const isHorizontal = orientation === "horizontal";
  const spacingValue = `var(--space-${spacing}, var(--space-md))`;

  if (label && isHorizontal) {
    return (
      <div
        className={`divider-with-label ${className}`.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
          margin: `${spacingValue} 0`,
          width: "100%",
          ...style,
        }}
        {...props}
      >
        <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-subtle)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-wider)",
            fontFamily: "var(--font-family-heading)",
          }}
        >
          {label}
        </span>
        <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
      </div>
    );
  }

  return (
    <hr
      className={`divider ${className}`.trim()}
      style={{
        border: "none",
        backgroundColor: "var(--color-border-subtle)",
        ...(isHorizontal
          ? {
              height: "1px",
              width: "100%",
              margin: `${spacingValue} 0`,
            }
          : {
              width: "1px",
              height: "100%",
              margin: `0 ${spacingValue}`,
              alignSelf: "stretch",
            }),
        ...style,
      }}
      {...props}
    />
  );
}

export default Divider;
