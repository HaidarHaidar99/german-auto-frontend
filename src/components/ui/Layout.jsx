import React from "react";

/**
 * German Auto — Layout Primitives
 * Mobile-first container, section, stack, and grid layout components.
 */

export function Container({
  children,
  size = "default",
  gutter = true,
  className = "",
  style = {},
  as: Component = "div",
  ...props
}) {
  const maxContentWidth = {
    narrow: "var(--container-narrow)",
    default: "var(--container-default)",
    wide: "var(--container-wide)",
    ultrawide: "var(--container-ultrawide)",
    full: "100%",
  }[size] || "var(--container-default)";

  const containerStyle = {
    width: "100%",
    maxWidth: maxContentWidth,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: gutter ? "clamp(var(--gutter-mobile), 3vw, var(--gutter-desktop))" : "0",
    paddingRight: gutter ? "clamp(var(--gutter-mobile), 3vw, var(--gutter-desktop))" : "0",
    ...style,
  };

  return (
    <Component
      className={`layout-container ${className}`.trim()}
      style={containerStyle}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Section({
  children,
  spacing = "default",
  as: Component = "section",
  className = "",
  style = {},
  ...props
}) {
  const spacingStyle = {
    none: { paddingTop: 0, paddingBottom: 0 },
    compact: {
      paddingTop: "clamp(var(--space-xl), 4vw, var(--space-2xl))",
      paddingBottom: "clamp(var(--space-xl), 4vw, var(--space-2xl))",
    },
    default: {
      paddingTop: "clamp(var(--space-2xl), 6vw, var(--space-3xl))",
      paddingBottom: "clamp(var(--space-2xl), 6vw, var(--space-3xl))",
    },
    spacious: {
      paddingTop: "clamp(var(--space-3xl), 8vw, var(--space-4xl))",
      paddingBottom: "clamp(var(--space-3xl), 8vw, var(--space-4xl))",
    },
    hero: {
      paddingTop: "calc(var(--header-height) + var(--space-xl))",
      paddingBottom: "clamp(var(--space-2xl), 6vw, var(--space-4xl))",
    },
  }[spacing] || {};

  return (
    <Component
      className={`layout-section ${className}`.trim()}
      style={{ width: "100%", position: "relative", ...spacingStyle, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Stack({
  children,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "flex-start",
  wrap = false,
  className = "",
  style = {},
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`layout-stack ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: direction,
        gap: `var(--space-${gap}, var(--space-md))`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Grid({
  children,
  cols = "responsive",
  gap = "md",
  className = "",
  style = {},
  as: Component = "div",
  ...props
}) {
  const gridTemplate = typeof cols === "number"
    ? `repeat(${cols}, minmax(0, 1fr))`
    : cols === "responsive"
    ? "repeat(auto-fit, minmax(min(100%, 300px), 1fr))"
    : cols;

  return (
    <Component
      className={`layout-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: `var(--space-${gap}, var(--space-md))`,
        width: "100%",
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
