import React from "react";

export function AdminSectionCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  style = {},
}) {
  return (
    <section
      className={`admin-section-card surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-admin-card)",
        borderRadius: "16px",
        border: "1px solid var(--color-admin-border)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
        ...style,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--color-admin-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: 700,
                  color: "var(--color-admin-text, #0f172a)",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ margin: "2px 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
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
      )}

      <div style={{ padding: "var(--space-lg)", flex: 1 }}>{children}</div>
    </section>
  );
}

export default AdminSectionCard;
