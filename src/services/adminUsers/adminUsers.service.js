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

export const adminUsersService = {
  /**
   * List users with optional search, role, verification status, and pagination.
   * @param {Object} params - { page, limit, role, is_verified, search }
   */
  getUsers: (params) => apiClient.get(`/admin/users${buildQuery(params)}`),

  /**
   * Get single user details by UUID (safe fields only).
   * @param {string} id - User UUID
   */
  getUser: (id) => apiClient.get(`/admin/users/${id}`),

  /**
   * Create an administrator account (ADMIN or SUPER_ADMIN).
   * @param {Object} payload - { full_name, email, password, role }
   */
  createAdmin: (payload) => apiClient.post("/admin/users", payload),

  /**
   * Update a user's role (CUSTOMER, ADMIN, or SUPER_ADMIN).
   * @param {string} id - User UUID
   * @param {string} role - Target role
   */
  updateRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),

  /**
   * Permanently delete a user account.
   * @param {string} id - User UUID
   */
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),

  /**
   * Revoke all active sessions for a user by incrementing token_version.
   * @param {string} id - User UUID
   */
  revokeSessions: (id) => apiClient.post(`/admin/users/${id}/revoke-sessions`, {}),
};

export default adminUsersService;
