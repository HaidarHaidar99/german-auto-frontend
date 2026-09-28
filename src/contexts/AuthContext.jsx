import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth/auth.service";
import carsService from "../services/cars/cars.service";
import { onUnauthorized } from "../services/api/client";

const AuthContext = createContext(null);
const AUTH_STORAGE_EVENT_KEY = "german_auto_auth_event";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'authenticated' | 'unauthenticated'
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const locationRef = useRef(location);
  const statusRef = useRef(status);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ─── Restore / Refresh User Session ──────────────────────────────────────────
  const refreshUser = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setStatus("loading");
      }
      const res = await authService.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        setStatus("authenticated");
        // Load user favorites
        try {
          const favRes = await carsService.getFavorites();
          const favIds = (favRes?.data?.favorite_car_ids || favRes?.data?.cars || []).map((c) =>
            typeof c === "string" ? c : c.id || c.car_id
          );
          setFavorites(favIds);
        } catch {
          setFavorites([]);
        }
      } else {
        setUser(null);
        setStatus("unauthenticated");
        setFavorites([]);
      }
      setError(null);
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      setFavorites([]);
    }
  }, []);

  // Initial session restoration on mount
  useEffect(() => {
    refreshUser(true);
  }, [refreshUser]);

  // ─── Broadcast Auth Events across Browser Tabs ─────────────────────────────
  const broadcastAuthEvent = useCallback((type) => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_EVENT_KEY,
        JSON.stringify({ type, timestamp: Date.now() })
      );
    } catch {
      // Ignore localStorage exceptions (e.g. strict private browsing)
    }
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    const res = await authService.login(email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
      setStatus("authenticated");
      broadcastAuthEvent("login");
      refreshUser(false);
    }
    return res;
  };

  const signup = async (payload) => {
    setError(null);
    return await authService.signup(payload);
  };

  const register = signup;

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      setFavorites([]);
      setError(null);
      broadcastAuthEvent("logout");

      // Clean redirect if currently on a protected route
      const currentPath = locationRef.current.pathname;
      const isProtected =
        currentPath.startsWith("/admincoresecure") ||
        currentPath.startsWith("/account");

      if (isProtected && currentPath !== "/login") {
        navigate("/login", { replace: true });
      }
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    return await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
  };

  const deleteAccount = async () => {
    try {
      const res = await authService.deleteAccount();
      return res;
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      setFavorites([]);
      setError(null);
      broadcastAuthEvent("logout");
      navigate("/login", { replace: true });
    }
  };

  // ─── Global 401 Unauthorized Interceptor ────────────────────────────────────
  useEffect(() => {
    let isHandling401 = false;
    let lockTimeout = null;

    const unsubscribe = onUnauthorized(({ endpoint }) => {
      // 1. Ignore public authentication workflows where 401 is expected credential failure
      const isPublicAuthEndpoint =
        endpoint.includes("/auth/login") ||
        endpoint.includes("/auth/signup") ||
        endpoint.includes("/auth/verify-email") ||
        endpoint.includes("/auth/forgot-password") ||
        endpoint.includes("/auth/reset-password");

      if (isPublicAuthEndpoint) {
        return;
      }

      // 2. Ignore /auth/me 401 during initial application boot (handled cleanly by refreshUser)
      if (endpoint.includes("/auth/me") && statusRef.current === "loading") {
        return;
      }

      // 3. Debounce parallel 401 responses (e.g. multiple widgets requesting data at once)
      if (isHandling401) {
        return;
      }
      isHandling401 = true;
      if (lockTimeout) clearTimeout(lockTimeout);
      lockTimeout = setTimeout(() => {
        isHandling401 = false;
      }, 1500);

      // 4. Invalidate local auth state
      setUser(null);
      setStatus("unauthenticated");
      setFavorites([]);
      broadcastAuthEvent("session_expired");

      // 5. If currently on a protected route, redirect to /login preserving the return path
      const currentLoc = locationRef.current;
      const currentPath = currentLoc.pathname;
      const isProtected =
        currentPath.startsWith("/admincoresecure") ||
        currentPath.startsWith("/account");

      if (isProtected && currentPath !== "/login") {
        navigate("/login", {
          replace: true,
          state: {
            from: { pathname: currentPath, search: currentLoc.search },
            reason: "session_expired",
          },
        });
      }
    });

    return () => {
      unsubscribe();
      if (lockTimeout) clearTimeout(lockTimeout);
    };
  }, [broadcastAuthEvent, navigate]);

  // ─── Multi-Tab Session Synchronization ─────────────────────────────────────
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === AUTH_STORAGE_EVENT_KEY && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          if (event.type === "logout" || event.type === "session_expired") {
            setUser(null);
            setStatus("unauthenticated");
            setFavorites([]);

            const currentPath = locationRef.current.pathname;
            const isProtected =
              currentPath.startsWith("/admincoresecure") ||
              currentPath.startsWith("/account");

            if (isProtected && currentPath !== "/login") {
              navigate("/login", {
                replace: true,
                state: {
                  from: { pathname: currentPath, search: locationRef.current.search },
                  reason: "session_expired",
                },
              });
            }
          } else if (event.type === "login") {
            // Another tab authenticated — synchronize session
            refreshUser(false);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, refreshUser]);

  // ─── Favorites Helpers ──────────────────────────────────────────────────────
  const isCarFavorite = (carId) => {
    return favorites.includes(carId);
  };

  const toggleFavorite = async (carId) => {
    if (status !== "authenticated") {
      return { authenticated: false };
    }

    const isFav = isCarFavorite(carId);
    try {
      if (isFav) {
        await carsService.removeFavorite(carId);
        setFavorites((prev) => prev.filter((id) => id !== carId));
      } else {
        await carsService.addFavorite(carId);
        setFavorites((prev) => [...prev, carId]);
      }
      return { success: true, isFavorite: !isFav };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const role = user?.role || null;
  const isAuthenticated = status === "authenticated";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const value = {
    user,
    status,
    role,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    error,
    login,
    signup,
    register,
    logout,
    changePassword,
    deleteAccount,
    refreshUser,
    favorites,
    setFavorites,
    isCarFavorite,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
