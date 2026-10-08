import React from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import Skeleton from "../ui/Skeleton";

export function AdminStatCard({
  label,
  value,
  subtitle,
  icon = "activity",
  iconBg,
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
        borderRadius: "16px",
        border: "1px solid var(--color-admin-border)",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (to) {
          e.currentTarget.style.borderColor = "var(--color-admin-accent)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.06)";
        }
      }}
      onMouseLeave={(e) => {
        if (to) {
          e.currentTarget.style.borderColor = "var(--color-admin-border)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
        }
      }}
    >
      {/* ── Left Colored Squircle Icon Box ──────────────────────── */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          backgroundColor: iconBg || "var(--color-admin-stat-icon-bg-1)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Icon name={icon} size={24} />
      </div>

      {/* ── Right Content: Label & Large Value ──────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            color: "var(--color-admin-muted)",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>

        <div>
          {loading ? (
            <Skeleton width="60px" height="32px" borderRadius="6px" />
          ) : (
            <span
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "var(--color-admin-text, #0f172a)",
                lineHeight: 1.1,
              }}
            >
              {value !== undefined && value !== null ? value : "—"}
            </span>
          )}
        </div>

        {subtitle && (
          <span style={{ fontSize: "12px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default AdminStatCard;
