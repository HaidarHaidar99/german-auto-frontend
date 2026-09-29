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
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "20px",
        ...style,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <h1
            style={{
              fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.4px",
              color: "var(--color-admin-text)",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p style={{ margin: 0, color: "var(--color-admin-muted)", fontSize: "13px" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;
