import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute from "./AdminRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import LoadingState from "../components/ui/LoadingState";

// Lazy-loaded pages for optimal bundle splitting
const HomePage           = lazy(() => import("../pages/public/HomePage"));
const CarsPage           = lazy(() => import("../pages/public/CarsPage"));
const CarDetailPage      = lazy(() => import("../pages/public/CarDetailPage"));
const AboutPage          = lazy(() => import("../pages/public/AboutPage"));
const ContactPage        = lazy(() => import("../pages/public/ContactPage"));
const SellYourCarPage    = lazy(() => import("../pages/public/SellYourCarPage"));
const NotFoundPage       = lazy(() => import("../pages/public/NotFoundPage"));

const LoginPage          = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage         = lazy(() => import("../pages/auth/SignupPage"));
const VerifyEmailPage    = lazy(() => import("../pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const ResetPasswordPage  = lazy(() => import("../pages/auth/ResetPasswordPage"));

const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const DesignSystemPage   = lazy(() => import("../pages/dev/DesignSystemPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState minHeight="80vh" />}>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:identifier" element={<CarDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/sell-your-car" element={<SellYourCarPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />

          {/* Authentication Routes (Restricted for already authenticated users) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Core Secure Route Boundary (ADMIN and SUPER_ADMIN only) */}
        <Route
          path="/admincoresecure"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
