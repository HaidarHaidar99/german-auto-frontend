import React from "react";

/**
 * German Auto — Typography Primitives
 * Editorial, restrained automotive typography system with long-word & price safety.
 */

export function Display({
  children,
  size = "xl",
  as: Component = "h1",
  className = "",
  style = {},
  ...props
}) {
  const sizeClass = {
    "2xl": "type-display-2xl",
    xl: "type-display-xl",
    lg: "type-display-lg",
  }[size] || "type-display-xl";

  return (
    <Component
      className={`${sizeClass} text-wrap-safe ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Heading({
  children,
  level = 2,
  size,
  as,
  className = "",
  style = {},
  ...props
}) {
  const Component = as || `h${level}`;
  const resolvedSize = size || `h${level}`;

  const sizeClass = {
    h1: "type-h1",
    h2: "type-h2",
    h3: "type-h3",
    h4: "type-h4",
  }[resolvedSize] || "type-h2";

  return (
    <Component
      className={`${sizeClass} text-wrap-safe ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Text({
  children,
  variant = "body",
  as: Component = "p",
  color,
  className = "",
  style = {},
  ...props
}) {
  const variantClass = {
    lead: "type-body-lead",
    body: "type-body",
    sm: "type-body-sm",
    caption: "type-caption",
  }[variant] || "type-body";

  const colorStyle = color ? { color: `var(--color-${color})` } : {};

  return (
    <Component
      className={`${variantClass} ${className}`.trim()}
      style={{ ...colorStyle, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Eyebrow({
  children,
  as: Component = "span",
  className = "",
  style = {},
  ...props
}) {
  return (
    <Component
      className={`type-eyebrow ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Price({
  value,
  currency = "€",
  oldPrice,
  size = "md",
  className = "",
  style = {},
  ...props
}) {
  // Format numeric value nicely for European/German standards if it's a number
  const formattedValue = typeof value === "number"
    ? new Intl.NumberFormat("de-DE").format(value)
    : value;

  const formattedOldPrice = typeof oldPrice === "number"
    ? new Intl.NumberFormat("de-DE").format(oldPrice)
    : oldPrice;

  const sizeClass = {
    lg: "type-price-lg",
    md: "",
    sm: "type-price-sm",
  }[size] || "";

  return (
    <div
      className={`type-price ${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      <span className="type-price-currency">{currency}</span>
      <span>{formattedValue}</span>
      {oldPrice && (
        <span className="type-price-old">
          {currency} {formattedOldPrice}
        </span>
      )}
    </div>
  );
}
