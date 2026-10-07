import apiClient from "../api/client";

function toFormData(fileOrFormData, fieldName = "file", extraFields = {}) {
  if (typeof FormData !== "undefined" && fileOrFormData instanceof FormData) {
    for (const [k, v] of Object.entries(extraFields)) {
      if (!fileOrFormData.has(k) && v !== undefined && v !== null) {
        fileOrFormData.append(k, v);
      }
    }
    return fileOrFormData;
  }
  const fd = new FormData();
  if (fileOrFormData) {
    fd.append(fieldName, fileOrFormData);
  }
  for (const [k, v] of Object.entries(extraFields)) {
    if (v !== undefined && v !== null) {
      fd.append(k, v);
    }
  }
  return fd;
}

export const settingsService = {
  getSettings: () => apiClient.get("/settings"),
  adminGetSettings: () => apiClient.get("/settings/admin"),
  adminUpdateSettings: (data) => apiClient.patch("/settings/admin", data),
  adminResetSection: (section) => apiClient.post(`/settings/admin/reset-section/${section}`, {}),
  adminUploadBranding: (fileOrFormData, type = "logo") =>
    apiClient.upload("/settings/admin/branding", toFormData(fileOrFormData, "file", { type })),
  uploadBrandingAsset: (fileOrFormData, type = "logo") =>
    apiClient.upload("/settings/admin/branding", toFormData(fileOrFormData, "file", { type })),
  adminUploadHeroMedia: (fileOrFormData) =>
    apiClient.upload("/settings/admin/hero/media", toFormData(fileOrFormData, "file")),
  uploadHeroMedia: (fileOrFormData) =>
    apiClient.upload("/settings/admin/hero/media", toFormData(fileOrFormData, "file")),
};

export default settingsService;
