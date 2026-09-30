import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth/auth.service";
import apiClient, { onUnauthorized } from "../services/api/client";

export const AdminAuthContext = createContext(null);

export const ADMIN_TOKEN_KEY = "german_auto_admin_token";
export const ADMIN_USER_KEY = "german_auto_admin_user";

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const raw = localStorage.getItem(ADMIN_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    return token ? "authenticated" : "unauthenticated";
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Refresh admin session from backend using admin token
  const refreshAdmin = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    if (!token) {
      setAdminUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const res = await apiClient.get("/auth/me", { isAdmin: true });
      const user = res?.data?.user;
      if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
        setAdminUser(user);
        setStatus("authenticated");
        try {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        } catch {
          // Ignore
        }
      } else {
        // Not an admin or user deactivated
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminUser(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      if (err?.statusCode === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminUser(null);
        setStatus("unauthenticated");
      }
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  // Handle 401 specifically for admin scope
  useEffect(() => {
    const unsubscribe = onUnauthorized(({ isAdminScope, endpoint }) => {
      if (!isAdminScope && !endpoint.includes("/admin")) return;
      if (endpoint.includes("/auth/login")) return;

      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setAdminUser(null);
      setStatus("unauthenticated");

      if (locationRef.current.pathname.startsWith("/admincoresecure")) {
        navigate("/admin/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Admin Login (completely isolated from customer login)
  const login = async (email, password) => {
    setError(null);
    const res = await apiClient.post(
      "/auth/login",
      { email, password, isAdminLogin: true },
      { headers: { "x-admin-portal": "true" }, isAdmin: true }
    );
    const user = res?.data?.user;
    const token = res?.data?.token;

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      const err = new Error("Zugriff verweigert. Dieses Konto ist nicht für das Admin-Portal autorisiert.");
      err.statusCode = 403;
      throw err;
    }

    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    setAdminUser(user);
    setStatus("authenticated");
    return res;
  };

  // Admin Logout (completely isolated from customer logout)
  const logout = async () => {
    try {
      await apiClient.post(
        "/auth/logout",
        { isAdminLogout: true },
        { headers: { "x-admin-portal": "true" }, isAdmin: true }
      );
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setAdminUser(null);
      setStatus("unauthenticated");
      setError(null);
      navigate("/admin/login", { replace: true });
    }
  };

  const role = adminUser?.role || null;
  const isAuthenticated = Boolean(adminUser && status === "authenticated");
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const value = {
    user: adminUser,
    adminUser,
    role,
    status,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    error,
    login,
    logout,
    refreshUser: refreshAdmin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  return context;
}

export default AdminAuthProvider;
