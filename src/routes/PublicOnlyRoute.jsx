import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "../components/ui/LoadingState";

export function PublicOnlyRoute({ children }) {
  const { status, isAuthenticated, isAdmin } = useAuth();

  if (status === "loading") {
    return <LoadingState minHeight="50vh" />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admincoresecure" : "/account"} replace />;
  }

  return children;
}

export default PublicOnlyRoute;
