import apiClient from "../api/client";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, String(val));
    }
  }
  const qStr = query.toString();
  return qStr ? `?${qStr}` : "";
}

export const formsService = {
  submitContact: (payload) => apiClient.post("/forms/contact", payload),
  submitSellCar: (formData) => apiClient.upload("/forms/sell-car", formData),
  adminGetForms: (params) => apiClient.get(`/forms/admin${buildQuery(params)}`),
  adminGetForm: (id) => apiClient.get(`/forms/admin/${id}`),
  adminUpdateForm: (id, data) => apiClient.patch(`/forms/admin/${id}`, data),
};

export default formsService;
