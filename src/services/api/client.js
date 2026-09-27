/**
 * German Auto — Centralized API Client
 * Uses native fetch with credentials: "include" for HttpOnly cookie authentication.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, statusCode, errors = null, rawData = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawData = rawData;
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Automatically attach application/json header unless payload is FormData
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
    credentials: "include", // Mandatory for HttpOnly cookies
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = text ? { message: text } : null;
    }

    if (!res.ok) {
      const message = data?.message || `HTTP Error ${res.status}: ${res.statusText}`;
      const errors = data?.errors || null;
      throw new ApiError(message, res.status, errors, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || "Network error. Please check your connection.", 0);
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "DELETE", body }),
  upload: (endpoint, formData, options = {}) => request(endpoint, { ...options, method: "POST", body: formData }),
};

export default apiClient;
