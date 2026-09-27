import apiClient from "../api/client";

export const authService = {
  getMe: () => apiClient.get("/auth/me"),
  login: (email, password) => apiClient.post("/auth/login", { email, password }),
  register: (payload) => apiClient.post("/auth/register", payload),
  logout: () => apiClient.post("/auth/logout"),
  verifyEmail: (token) => apiClient.post("/auth/verify-email", { token }),
  resendVerification: (email) => apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (payload) => apiClient.post("/auth/reset-password", payload),
  updatePassword: (currentPassword, newPassword) =>
    apiClient.post("/auth/update-password", { current_password: currentPassword, new_password: newPassword }),
  deleteAccount: (password) => apiClient.delete("/auth/me", { password }),
};

export default authService;
