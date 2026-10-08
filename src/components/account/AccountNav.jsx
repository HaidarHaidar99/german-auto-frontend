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
          >
            <Icon name={item.icon} size={16} />
            <span style={{ display: "block", maxWidth: "100%" }}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <style>{`
        .account-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 4px;
          border-radius: 10px;
          font-size: clamp(10px, 2.6vw, 12px);
          font-weight: 600;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.75);
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
          white-space: normal;
          word-break: break-word;
          line-height: 1.15;
          min-width: 0;
          box-sizing: border-box;
        }

        .account-nav-link:hover {
          color: #D4AF37;
          border-color: rgba(212, 175, 55, 0.4);
          background-color: rgba(212, 175, 55, 0.08);
        }

        .account-nav-link.is-active {
          color: #D4AF37;
          background-color: rgba(212, 175, 55, 0.18);
          border-color: rgba(212, 175, 55, 0.6);
        }

        /* Light Theme Overrides */
        [data-theme="light"] .account-nav-link,
        .theme-light .account-nav-link {
          color: #334155;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        [data-theme="light"] .account-nav-link:hover,
        .theme-light .account-nav-link:hover {
          color: #8A5A00;
          border-color: rgba(184, 134, 11, 0.45);
          background-color: rgba(212, 175, 55, 0.08);
        }

        [data-theme="light"] .account-nav-link.is-active,
        .theme-light .account-nav-link.is-active {
          color: #8A5A00;
          background-color: rgba(212, 175, 55, 0.14);
          border-color: rgba(184, 134, 11, 0.6);
          font-weight: 700;
        }
      `}</style>
    </nav>
  );
}

export default AccountNav;
