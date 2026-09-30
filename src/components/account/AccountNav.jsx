import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../common/Icon";

export function AccountNav({ className = "", style = {} }) {
  const { t } = useTranslation(["account", "common"]);

  const navItems = [
    { to: "/account", end: true, label: t("profile", { ns: "account", defaultValue: "Profile" }), icon: "user" },
    { to: "/account/favorites", end: false, label: t("navFavorites", { ns: "account", defaultValue: "Favorites" }), icon: "heart" },
    { to: "/account/security", end: false, label: t("changePasswordLink", { ns: "account", defaultValue: "Passwort ändern" }), icon: "lock" },
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
              color: isActive ? "#ffffff" : "var(--color-text-secondary)",
              backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "var(--color-card)",
              border: isActive ? "1px solid rgba(255, 255, 255, 0.4)" : "1px solid var(--color-border)",
              boxShadow: "none", // Explicitly no outside shadow per user request
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap",
            })}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default AccountNav;
