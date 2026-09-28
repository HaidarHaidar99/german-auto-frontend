import apiClient from "../api/client";

export const authService = {
  getMe: () => apiClient.get("/auth/me"),
  login: (email, password) => apiClient.post("/auth/login", { email, password }),
  signup: (payload) => apiClient.post("/auth/signup", payload),
  register: (payload) => apiClient.post("/auth/signup", payload),
  logout: () => apiClient.post("/auth/logout"),
  verifyEmail: (token) => apiClient.post("/auth/verify-email", { token }),
  resendVerification: (email) => apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (payload) => apiClient.post("/auth/reset-password", payload),
  changePassword: (currentPassword, newPassword, confirmNewPassword) =>
    apiClient.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
      ...(confirmNewPassword !== undefined ? { confirm_new_password: confirmNewPassword } : {}),
    }),
  updatePassword: (currentPassword, newPassword, confirmNewPassword) =>
    apiClient.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
      ...(confirmNewPassword !== undefined ? { confirm_new_password: confirmNewPassword } : {}),
    }),
  deleteAccount: () => apiClient.delete("/auth/delete-account"),
};

export default authService;
