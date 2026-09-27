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

export const notificationsService = {
  getNotifications: (params) => apiClient.get(`/notifications${buildQuery(params)}`),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`, {}),
  markUnread: (id) => apiClient.patch(`/notifications/${id}/unread`, {}),
  dismissNotification: (id) => apiClient.delete(`/notifications/${id}`),
  getPreferences: () => apiClient.get("/notifications/preferences"),
  updatePreferences: (prefs) => apiClient.patch("/notifications/preferences", prefs),
  subscribePush: (subscription) => apiClient.post("/notifications/push/subscribe", subscription),
  unsubscribePush: (endpoint) => apiClient.delete("/notifications/push/subscribe", { endpoint }),
};

export default notificationsService;
