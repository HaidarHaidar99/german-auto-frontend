/**
 * German Auto — Centralized API Client
 * Uses native fetch with credentials: "include" for HttpOnly cookie authentication.
 */

export const getBaseUrl = () => {
  // If running in browser and NOT localhost/127.0.0.1, ALWAYS use real production backend
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "https://german-auto-backend.vercel.app/api";
    }
  }

  // Local development: explicit env var if set, otherwise localhost
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "http://localhost:5000/api";
};

export class ApiError extends Error {
  constructor(message, statusCode, errors = null, rawData = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawData = rawData;
  }
}

// ─── 401 Unauthorized Interceptor System ─────────────────────────────────────

const unauthorizedListeners = new Set();

/**
 * Register a subscriber for 401 Unauthorized responses.
 * @param {Function} callback - ({ endpoint, url, message, data, status }) => void
 * @returns {Function} unsubscribe function
 */
export function onUnauthorized(callback) {
  unauthorizedListeners.add(callback);
  return () => {
    unauthorizedListeners.delete(callback);
  };
}

function notifyUnauthorized(payload) {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      // Do not let listener exceptions crash API calls
    }
  });
}

// ─── Request Dispatcher ───────────────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Attach user's active language preference if not explicitly provided
  if (!headers["Accept-Language"] && typeof window !== "undefined") {
    const activeLang = window.localStorage.getItem("german_auto_lang") || "de";
    headers["Accept-Language"] = activeLang;
  }

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

      // Broadcast 401 Unauthorized event to listeners for session handling
      if (res.status === 401) {
        notifyUnauthorized({ endpoint, url, message, data, status: res.status });
      }

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
