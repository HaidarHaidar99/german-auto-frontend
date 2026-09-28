import React from "react";

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`admin-page-header ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-md)",
        marginBottom: "var(--space-2xl)",
        paddingBottom: "var(--space-md)",
        borderBottom: "1px solid var(--color-admin-border)",
        ...style,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "var(--color-admin-text)",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p style={{ margin: 0, color: "var(--color-admin-muted)", fontSize: "var(--font-size-sm)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;
