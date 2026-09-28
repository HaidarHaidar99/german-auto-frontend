import React from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import Skeleton from "../ui/Skeleton";

export function AdminStatCard({
  label,
  value,
  subtitle,
  icon = "activity",
  to,
  loading = false,
  className = "",
  style = {},
}) {
  const content = (
    <div
      className={`admin-stat-card surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-admin-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-admin-border)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-elevation-1)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        transition: "all var(--transition-fast)",
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (to) {
          e.currentTarget.style.borderColor = "var(--color-secondary)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (to) {
          e.currentTarget.style.borderColor = "var(--color-admin-border)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "var(--color-admin-muted)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(197, 160, 89, 0.12)",
            color: "var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div style={{ margin: "var(--space-xs) 0 2px 0" }}>
        {loading ? (
          <Skeleton width="60px" height="32px" borderRadius="var(--radius-sm)" />
        ) : (
          <span
            style={{
              fontSize: "clamp(1.75rem, 2.5vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "var(--color-admin-text)",
            }}
          >
            {value !== undefined && value !== null ? value : "—"}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
          {subtitle}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default AdminStatCard;
