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
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-sm)",
        fontWeight: isActive ? 600 : 500,
        textDecoration: "none",
        color: isActive ? "#ffffff" : "var(--color-admin-muted)",
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
        borderLeft: isActive ? "3px solid #ffffff" : "3px solid transparent",
        transition: "all var(--transition-fast)",
        ...style,
      })}
    >
      {({ isActive }) => (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && (
              <span style={{ display: "flex", alignItems: "center", color: isActive ? "#ffffff" : "var(--color-admin-muted)" }}>
                <Icon name={icon} size={18} />
              </span>
            )}
            <span>{label}</span>
          </div>

          {typeof badgeCount === "number" && badgeCount > 0 && (
            <Badge variant="secondary" size="sm">
              {badgeCount}
            </Badge>
          )}
        </>
      )}
    </NavLink>
  );
}

export default AdminNavItem;
