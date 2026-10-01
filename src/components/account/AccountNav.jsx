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
    { to: "/account/reviews", end: false, label: t("myReviews", { ns: "account", defaultValue: "Meine Bewertungen" }), icon: "star" },
    { to: "/account/security", end: false, label: t("changePasswordLink", { ns: "account", defaultValue: "Passwort ändern" }), icon: "lock" },
  ];

  return (
    <nav
      className={`account-nav ${className}`.trim()}
      aria-label="Account-Navigation"
      style={{
        width: "100%",
        marginBottom: "var(--space-xl)",
        ...style,
      }}
    >
      <div
        className="account-nav-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          width: "100%",
          boxSizing: "border-box",
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "10px 4px",
              borderRadius: "10px",
              fontSize: "clamp(10px, 2.6vw, 12px)",
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#D4AF37" : "rgba(255, 255, 255, 0.85)",
              backgroundColor: isActive ? "rgba(212, 175, 55, 0.18)" : "rgba(212, 175, 55, 0.06)",
              border: isActive ? "1px solid rgba(212, 175, 55, 0.6)" : "1px solid rgba(212, 175, 55, 0.2)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              textAlign: "center",
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: 1.15,
              minWidth: 0,
              boxSizing: "border-box",
            })}
          >
            <Icon name={item.icon} size={16} />
            <span style={{ display: "block", maxWidth: "100%" }}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default AccountNav;
