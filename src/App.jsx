import React from "react";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import AosManager from "./components/common/AosManager";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import AppRoutes from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AosManager />
      <AuthProvider>
        <AdminAuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              <AppRoutes />
            </SettingsProvider>
          </ThemeProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
