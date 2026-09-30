import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AdminUserMenu({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
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
            color: "#ffffff",
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
          </div>
          <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
            {user?.email}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminUserMenu;
