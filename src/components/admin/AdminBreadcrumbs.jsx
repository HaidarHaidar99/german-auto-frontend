import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

export function AdminBreadcrumbs({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const location = useLocation();

  const segmentMap = {
    settings: t("settings"),
    cars: t("inventory"),
    forms: t("forms"),
    reviews: t("reviews"),
    notifications: t("notifications"),
  };

  const segments = location.pathname
    .replace(/^\/admincoresecure\/?/, "")
    .split("/")
    .filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`admin-breadcrumbs ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-admin-muted)",
        ...style,
      }}
    >
      <Link
        to="/admincoresecure"
        style={{
          color: segments.length === 0 ? "var(--color-admin-text)" : "var(--color-admin-muted)",
          textDecoration: "none",
          fontWeight: segments.length === 0 ? 600 : 400,
          transition: "color var(--transition-fast)",
        }}
      >
        {t("dashboard")}
      </Link>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const label = segmentMap[seg] || seg;
        const path = `/admincoresecure/${segments.slice(0, idx + 1).join("/")}`;

        return (
          <React.Fragment key={path}>
            <span style={{ color: "var(--color-admin-border)", display: "flex", alignItems: "center" }}>
              <Icon name="chevron-right" size={12} />
            </span>
            {isLast ? (
              <span style={{ color: "var(--color-admin-text)", fontWeight: 600 }}>{label}</span>
            ) : (
              <Link
                to={path}
                style={{
                  color: "var(--color-admin-muted)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default AdminBreadcrumbs;
