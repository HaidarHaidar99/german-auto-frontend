import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import AppRoutes from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
