import apiClient from "../api/client";

export const settingsService = {
  getSettings: () => apiClient.get("/settings"),
  adminGetSettings: () => apiClient.get("/settings/admin"),
  adminUpdateSettings: (data) => apiClient.patch("/settings/admin", data),
  adminResetSection: (section) => apiClient.post(`/settings/admin/reset-section/${section}`, {}),
  adminUploadBranding: (formData) => apiClient.upload("/settings/admin/branding", formData),
  adminUploadHeroMedia: (formData) => apiClient.upload("/settings/admin/hero/media", formData),
};

export default settingsService;
