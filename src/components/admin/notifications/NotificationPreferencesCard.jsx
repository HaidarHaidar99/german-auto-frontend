import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import notificationsService from "../../../services/notifications/notifications.service";

export function NotificationPreferencesCard({
  preferences = { forms: true, reviews: true, push: true, sound: true },
  onUpdatePreferences,
  isSaving = false,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  // Push notification browser state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");
  const [pushWorking, setPushWorking] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async (key) => {
    if (isSaving) return;
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    await onUpdatePreferences?.(updated);
  };

  const handleRequestPushPermission = async () => {
    if (!pushSupported) return;
    try {
      setPushWorking(true);
      setPushStatusMessage(null);

      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        // Register service worker if available
        let reg;
        try {
          reg = await navigator.serviceWorker.ready;
        } catch {
          // If no active registration, try to register or proceed
        }

        let sub = null;
        if (reg?.pushManager) {
          sub = await reg.pushManager.getSubscription();
          if (!sub) {
            // Subscribe with mock applicationServerKey or public options
            // Note: If no VAPID is set, standard browser subscribe may require applicationServerKey
            // We guard safely:
            try {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: null,
              });
            } catch {
              // Browser may require a VAPID server key
            }
          }
        }

        // If subscription is created, inform backend
        if (sub) {
          const rawKey = sub.getKey ? sub.getKey("p256dh") : null;
          const rawAuth = sub.getKey ? sub.getKey("auth") : null;
          const p256dh = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : "web_push_key";
          const auth = rawAuth ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuth))) : "web_push_auth";

          await notificationsService.subscribePush({
            endpoint: sub.endpoint,
            keys: { p256dh, auth },
          });
        }

        // Update preferences
        await onUpdatePreferences?.({ ...preferences, push: true });
        setPushStatusMessage({ type: "success", text: t("pushPermissionGranted", { defaultValue: "Push permission granted." }) });
      } else if (permission === "denied") {
        setPushStatusMessage({
          type: "error",
          text: t("pushPermissionDenied", { defaultValue: "Push notifications blocked in browser." }),
        });
      }
    } catch (err) {
      setPushStatusMessage({ type: "error", text: err?.message || t("errorPushActivation", { defaultValue: "Error enabling push notifications." }) });
    } finally {
      setPushWorking(false);
    }
  };

  const handleDisablePush = async () => {
    try {
      setPushWorking(true);
      setPushStatusMessage(null);

      if (navigator.serviceWorker) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg?.pushManager) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
            await notificationsService.unsubscribePush(sub.endpoint).catch(() => {});
          }
        }
      }

      await onUpdatePreferences?.({ ...preferences, push: false });
      setPushStatusMessage({ type: "success", text: t("disablePush", { defaultValue: "Push disabled." }) });
    } catch (err) {
      setPushStatusMessage({ type: "error", text: err?.message || t("errorPushDeactivation", { defaultValue: "Error disabling push notifications." }) });
    } finally {
      setPushWorking(false);
    }
  };

  const toggleItems = [
    {
      key: "forms",
      label: t("prefFormsLabel", { defaultValue: "Form Submissions" }),
      description: t("prefFormsDesc", { defaultValue: "Show alerts for new contact and purchase requests in the feed" }),
      icon: "message-square",
      color: "#a855f7",
      value: preferences.forms ?? true,
    },
    {
      key: "reviews",
      label: t("prefReviewsLabel", { defaultValue: "Customer Reviews" }),
      description: t("prefReviewsDesc", { defaultValue: "Show alerts for newly submitted customer reviews in the feed" }),
      icon: "star",
      color: "#06b6d4",
      value: preferences.reviews ?? true,
    },
    {
      key: "push",
      label: t("prefPushLabel", { defaultValue: "Browser Push Notifications" }),
      description: t("prefPushDesc", { defaultValue: "Receive instant desktop alerts for new events" }),
      icon: "send",
      color: "#f59e0b",
      value: preferences.push ?? true,
      hasPushFlow: true,
    },
    {
      key: "sound",
      label: t("prefSoundLabel", { defaultValue: "Sound Alert" }),
      description: t("prefSoundDesc", { defaultValue: "Play an audio chime when new alerts arrive in admin" }),
      icon: "volume-2",
      color: "#22c55e",
      value: preferences.sound ?? true,
    },
  ];

  return (
    <AdminSectionCard
      title={t("notificationPreferences", { defaultValue: "Notification Preferences" })}
      className={className}
      style={{ ...style }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md, 16px)" }}>
        {toggleItems.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              backgroundColor: "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.02))",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "220px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Icon name={item.icon} size={18} />
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-admin-text, #0f172a)" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-admin-muted, #94a3b8)", marginTop: "2px", lineHeight: 1.4 }}>
                  {item.description}
                </div>

                {/* Additional Browser Push controls */}
                {item.hasPushFlow && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {!pushSupported ? (
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)" }}>
                        {t("pushNotSupported", { defaultValue: "Your browser does not support web push notifications." })}
                      </span>
                    ) : pushPermission === "granted" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>
                          ● {t("pushPermissionGranted", { defaultValue: "Push permission granted" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pushWorking || isSaving}
                          onClick={handleDisablePush}
                          style={{ fontSize: "11px", padding: "2px 8px", height: "26px" }}
                        >
                          {t("disablePush", { defaultValue: "Disable push" })}
                        </Button>
                      </div>
                    ) : pushPermission === "denied" ? (
                      <span style={{ fontSize: "11px", color: "var(--color-error, #ef4444)" }}>
                        {t("pushPermissionDenied", { defaultValue: "Push blocked in browser" })}
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pushWorking || isSaving}
                        onClick={handleRequestPushPermission}
                        style={{ fontSize: "11px", padding: "2px 10px", height: "28px" }}
                      >
                        <Icon name="bell" size={12} /> {t("enablePush", { defaultValue: "Enable push in browser" })}
                      </Button>
                    )}

                    {pushStatusMessage && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: pushStatusMessage.type === "success" ? "#4ade80" : "var(--color-error, #ef4444)",
                        }}
                      >
                        {pushStatusMessage.text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Switch Button */}
            <button
              type="button"
              role="switch"
              aria-checked={item.value}
              aria-label={item.label}
              disabled={isSaving}
              onClick={() => handleToggle(item.key)}
              style={{
                width: "46px",
                height: "26px",
                borderRadius: "9999px",
                border: item.value
                  ? "1px solid var(--color-admin-accent, #2563eb)"
                  : "1px solid var(--color-admin-border, rgba(148, 163, 184, 0.4))",
                backgroundColor: item.value ? "var(--color-admin-accent, #2563eb)" : "var(--color-admin-surface-muted, rgba(148, 163, 184, 0.3))",
                boxShadow: item.value ? "0 0 10px rgba(37, 99, 235, 0.35)" : "none",
                cursor: isSaving ? "not-allowed" : "pointer",
                position: "relative",
                transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                padding: "2px",
                outline: "none",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  transform: item.value ? "translateX(20px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </AdminSectionCard>
  );
}

export default NotificationPreferencesCard;
