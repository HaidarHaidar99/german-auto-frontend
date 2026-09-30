import apiClient from "../api/client";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
      query.append(key, String(val));
    }
  }
  const qStr = query.toString();
  return qStr ? `?${qStr}` : "";
}

export const carsService = {
  getCars: (params) => apiClient.get(`/cars${buildQuery(params)}`),
  getCar: (identifier) => apiClient.get(`/cars/${identifier}`),
  getFavorites: () => apiClient.get("/cars/favorites"),
  addFavorite: (car_id) => apiClient.post("/cars/favorites", { car_id }),
  removeFavorite: (carId) => apiClient.delete(`/cars/favorites/${carId}`),
  adminGetCars: (params) => apiClient.get(`/cars/admin/list${buildQuery(params)}`),
  adminGetCar: (identifier) => apiClient.get(`/cars/admin/${identifier}`),
  adminCreateCar: (data) => apiClient.post("/cars/admin", data),
  adminUpdateCar: (id, data) => apiClient.patch(`/cars/admin/${id}`, data),
  adminDeleteCar: (id) => apiClient.delete(`/cars/admin/${id}`),
  adminSetStatus: (id, status) => apiClient.patch(`/cars/admin/${id}/status`, { status }),
  adminToggleFeatured: (id, is_featured) => apiClient.patch(`/cars/admin/${id}/featured`, { is_featured }),
  adminSetVisibility: (id, is_visible) => apiClient.patch(`/cars/admin/${id}/visibility`, { is_visible }),
  adminUploadMedia: (formData) => apiClient.upload("/cars/admin/upload-media", formData),
};

export default carsService;
