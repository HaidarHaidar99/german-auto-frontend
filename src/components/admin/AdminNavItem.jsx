import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "../common/Icon";
import Badge from "../ui/Badge";

export function AdminNavItem({
  to,
  label,
  icon,
  badgeCount,
  end = false,
  onClick,
  className = "",
  style = {},
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `admin-nav-item ${isActive ? "is-active" : ""} ${className}`.trim()
      }
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: "0 10px 10px 0",
        fontSize: "14px",
        fontWeight: isActive ? 600 : 500,
        textDecoration: "none",
        color: isActive ? "var(--color-admin-nav-active-border)" : "var(--color-admin-muted)",
        backgroundColor: isActive ? "var(--color-admin-accent-subtle)" : "transparent",
        borderLeft: isActive ? "3px solid var(--color-admin-nav-active-border)" : "3px solid transparent",
        transition: "all 0.15s ease",
        marginBottom: "2px",
        ...style,
      })}
    >
      {({ isActive }) => (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "20px",
                  height: "20px",
                  color: isActive ? "var(--color-admin-nav-active-border)" : "var(--color-admin-muted)",
                  opacity: isActive ? 1 : 0.9,
                  transition: "color 0.15s ease, opacity 0.15s ease",
                }}
              >
                <Icon name={icon} size={18} strokeWidth={isActive ? 2 : 1.75} />
              </span>
            )}
            <span style={{ letterSpacing: "-0.1px" }}>{label}</span>
          </div>

          {typeof badgeCount === "number" && badgeCount > 0 && (
            <span
              style={{
                backgroundColor: "var(--color-admin-nav-active-border)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "9999px",
                padding: "2px 8px",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {badgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default AdminNavItem;
