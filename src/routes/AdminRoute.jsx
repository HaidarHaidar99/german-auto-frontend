import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import UnauthorizedState from "../components/ui/UnauthorizedState";

export function AdminRoute({ children }) {
  const { status, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingState minHeight="50vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <UnauthorizedState message="Zugriff verweigert. Dieser Bereich ist nur für Administratoren zugänglich." />;
  }

  return children;
}

export default AdminRoute;
