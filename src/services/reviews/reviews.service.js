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

export const reviewsService = {
  getReviews: (params) => apiClient.get(`/reviews${buildQuery(params)}`),
  submitReview: (payloadOrFormData) => {
    if (typeof FormData !== "undefined" && payloadOrFormData instanceof FormData) {
      return apiClient.upload("/reviews", payloadOrFormData);
    }
    return apiClient.post("/reviews", payloadOrFormData);
  },
  adminGetReviews: (params) => apiClient.get(`/reviews/admin${buildQuery(params)}`),
  adminGetReview: (id) => apiClient.get(`/reviews/admin/${id}`),
  adminUpdateReview: (id, data) => apiClient.patch(`/reviews/admin/${id}`, data),
  adminDeleteReview: (id) => apiClient.delete(`/reviews/admin/${id}`),
};

export default reviewsService;
