import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth/auth.service";
import apiClient, { onUnauthorized } from "../services/api/client";

export const AdminAuthContext = createContext(null);

export const ADMIN_TOKEN_KEY = "german_auto_admin_token";
export const ADMIN_USER_KEY = "german_auto_admin_user";
export const ADMIN_LOGIN_TIME_KEY = "german_auto_admin_login_time";

// Exactly 1 full day in milliseconds (24 hours)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Checks if the stored JWT is structurally expired based on its standard exp claim
 */
function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload?.exp) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSeconds;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if the session has exceeded 1 day from the moment the user logged in
 */
function isSessionPastOneDay() {
  try {
    const loginTime = localStorage.getItem(ADMIN_LOGIN_TIME_KEY);
    if (!loginTime) return false;
    return Date.now() - Number(loginTime) > ONE_DAY_MS;
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      if (isSessionPastOneDay()) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
        return null;
      }
      const raw = localStorage.getItem(ADMIN_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") return "unauthenticated";
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token || isSessionPastOneDay() || isTokenExpired(token)) {
      return "unauthenticated";
    }
    return "authenticated";
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

    // Enforce 1 day limit from login time
    if (isSessionPastOneDay() || isTokenExpired(token)) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
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
        // Role demoted or account deactivated
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
        setAdminUser(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      // ONLY invalidate if token is strictly expired or rejected by auth/me
      if (err?.statusCode === 401 && (isSessionPastOneDay() || isTokenExpired(token))) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
        setAdminUser(null);
        setStatus("unauthenticated");
      }
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  // Handle 401 specifically for admin scope:
  // Stands for 1 full day from login; background polling or transient 401 will NOT kick admin out.
  useEffect(() => {
    const unsubscribe = onUnauthorized(({ isAdminScope, endpoint }) => {
      if (!isAdminScope && !endpoint.includes("/admin")) return;
      if (endpoint.includes("/auth/login")) return;

      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      // If the admin logged in less than 24 hours ago, do not abruptly logout on minor background errors
      if (!isSessionPastOneDay() && !isTokenExpired(token)) {
        if (!endpoint.includes("/auth/me")) {
          return;
        }
      }

      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
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
    localStorage.setItem(ADMIN_LOGIN_TIME_KEY, Date.now().toString()); // Starts 1-day timer
    setAdminUser(user);
    setStatus("authenticated");
    return res;
  };

  // Admin Logout
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
      localStorage.removeItem(ADMIN_LOGIN_TIME_KEY);
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

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;
