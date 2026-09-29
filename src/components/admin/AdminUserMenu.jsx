import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AdminUserMenu({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <div
      className={`admin-user-menu ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        {/* Monogram circle */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            color: "var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user?.full_name
            ? user.full_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "AD"}
        </div>

        <div className="hide-mobile" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text)" }}>
              {user?.full_name || user?.email}
            </span>
            <Badge variant={isSuperAdmin ? "secondary" : "outline"} size="sm">
              {isSuperAdmin ? t("superAdmin") : t("admin")}
            </Badge>
          </div>
          <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
            {user?.email}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        title={t("logout")}
        aria-label={t("logout")}
        style={{
          background: "none",
          border: "1px solid var(--color-admin-border)",
          borderRadius: "var(--radius-md)",
          padding: "6px 10px",
          color: "var(--color-admin-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "var(--font-size-xs)",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-error)";
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-admin-muted)";
          e.currentTarget.style.borderColor = "var(--color-admin-border)";
        }}
      >
        <Icon name="log-out" size={14} />
        <span className="hide-mobile">{t("logout")}</span>
      </button>
    </div>
  );
}

export default AdminUserMenu;
