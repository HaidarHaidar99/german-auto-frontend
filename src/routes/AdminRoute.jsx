import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import LoadingState from "../components/ui/LoadingState";
import UnauthorizedState from "../components/ui/UnauthorizedState";

export function AdminRoute({ children, requireSuperAdmin = false }) {
  const { t } = useTranslation(["admin", "auth", "common"]);
  const { status, isAuthenticated, isAdmin, isSuperAdmin } = useAdminAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingState minHeight="50vh" />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <UnauthorizedState
        message={t("superAdminOnlyNotice", {
          defaultValue: "Zugriff verweigert. Dieser Bereich erfordert Super-Administrator-Rechte.",
        })}
      />
    );
  }

  return children;
}

export default AdminRoute;
