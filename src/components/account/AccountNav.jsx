import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../common/Icon";

export function AccountNav({ className = "", style = {} }) {
  const { t } = useTranslation(["account", "common"]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/account", end: true, label: t("profile", { ns: "account", defaultValue: "Profile" }), icon: "user" },
    { to: "/account/favorites", end: false, label: t("navFavorites", { ns: "account" }), icon: "heart" },
  ];

  return (
    <nav
      className={`account-nav ${className}`.trim()}
      aria-label="Account-Navigation"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "var(--space-xs)",
        overflowX: "auto",
        paddingBottom: "var(--space-2xs)",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        ...style,
      }}
    >
      <div
        className="account-nav-list"
        style={{
          display: "flex",
          gap: "var(--space-xs)",
          width: "100%",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `account-nav-link ${isActive ? "is-active" : ""}`
            }
            style={({ isActive }) => ({
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "10px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--font-size-sm)",
              fontWeight: isActive ? 600 : 500,
              textDecoration: "none",
              color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
              backgroundColor: isActive ? "var(--color-surface-hover)" : "var(--color-card)",
              border: isActive ? "1px solid var(--color-secondary)" : "1px solid var(--color-border)",
              boxShadow: isActive ? "0 0 12px rgba(255, 255, 255, 0.15)" : "none",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap",
            })}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="account-nav-logout"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            padding: "10px 18px",
            borderRadius: "var(--radius-full)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "var(--color-text-muted)",
            backgroundColor: "transparent",
            border: "1px solid var(--color-border-subtle)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            marginLeft: "auto",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-error)";
            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.borderColor = "var(--color-border-subtle)";
          }}
        >
          <Icon name="log-out" size={16} />
          <span>{t("navLogout")}</span>
        </button>
      </div>
    </nav>
  );
}

export default AccountNav;
