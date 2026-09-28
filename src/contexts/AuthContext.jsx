import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/auth/auth.service";
import carsService from "../services/cars/cars.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'authenticated' | 'unauthenticated'
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  // Restore authenticated session via HttpOnly cookie
  const refreshUser = useCallback(async () => {
    try {
      setStatus("loading");
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

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    setError(null);
    const res = await authService.login(email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
      setStatus("authenticated");
      refreshUser();
    }
    return res;
  };

  const signup = async (payload) => {
    setError(null);
    return await authService.signup(payload);
  };

  const register = signup;

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      setFavorites([]);
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
    }
  };

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
