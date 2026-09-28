import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Badge from "../../ui/Badge";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import Button from "../../ui/Button";

export function NotificationList({
  notifications = [],
  onSelectNotification,
  onToggleRead,
  onDismiss,
  updatingId = null,
  className = "",
  style = {},
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";
  const [confirmDismissId, setConfirmDismissId] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(currentLang === "de" ? "de-DE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "CONTACT_FORM":
        return {
          label: t("filterContactForms", { defaultValue: "Kontaktanfrage" }),
          icon: "message-square",
          color: "#a855f7",
          bg: "rgba(168, 85, 247, 0.12)",
          targetRoute: "/admincoresecure/forms",
          targetLabel: t("openInForms", { defaultValue: "Formulare" }),
        };
      case "SELL_CAR_FORM":
        return {
          label: t("filterSellCarForms", { defaultValue: "Fahrzeugankauf" }),
          icon: "car",
          color: "#f97316",
          bg: "rgba(249, 115, 22, 0.12)",
          targetRoute: "/admincoresecure/forms",
          targetLabel: t("openInForms", { defaultValue: "Ankauf" }),
        };
      case "NEW_REVIEW":
        return {
          label: t("filterReviews", { defaultValue: "Kundenbewertung" }),
          icon: "star",
          color: "#06b6d4",
          bg: "rgba(6, 182, 212, 0.12)",
          targetRoute: "/admincoresecure/reviews",
          targetLabel: t("openInReviews", { defaultValue: "Reviews" }),
        };
      default:
        return {
          label: t("filterSystem", { defaultValue: "Systemmeldung" }),
          icon: "bell",
          color: "var(--color-primary, #C5A059)",
          bg: "rgba(197, 160, 89, 0.12)",
          targetRoute: null,
          targetLabel: null,
        };
    }
  };

  const handleDismiss = (id) => {
    onDismiss?.(id);
    setConfirmDismissId(null);
  };

  return (
    <div
      className={`notification-list ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm, 12px)",
        ...style,
      }}
    >
      {notifications.map((notif) => {
        const typeCfg = getTypeConfig(notif.type);
        const isUpdating = updatingId === notif.id;
        const isDismissConfirm = confirmDismissId === notif.id;

        return (
          <div
            key={notif.id}
            style={{
              padding: "var(--space-md, 16px)",
              borderRadius: "var(--radius-md, 8px)",
              backgroundColor: notif.is_read
                ? "var(--color-admin-card, #121418)"
                : "rgba(197, 160, 89, 0.06)",
              border: notif.is_read
                ? "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))"
                : "1px solid rgba(197, 160, 89, 0.35)",
              borderLeft: notif.is_read
                ? "3px solid transparent"
                : "3px solid var(--color-primary, #C5A059)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--space-md, 16px)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Left: Icon & Content */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-md, 14px)",
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Type Icon Badge */}
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: typeCfg.bg,
                  color: typeCfg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Icon name={typeCfg.icon} size={18} />
              </div>

              {/* Text & Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectNotification?.(notif)}
                    onKeyDown={(e) => e.key === "Enter" && onSelectNotification?.(notif)}
                    style={{
                      fontSize: "var(--font-size-sm, 14px)",
                      fontWeight: notif.is_read ? 600 : 700,
                      color: notif.is_read ? "var(--color-admin-text, #ffffff)" : "var(--color-primary, #C5A059)",
                      cursor: "pointer",
                    }}
                  >
                    {notif.title}
                  </span>

                  <Badge
                    variant="outline"
                    size="sm"
                    style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      color: typeCfg.color,
                      borderColor: "rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    {typeCfg.label}
                  </Badge>

                  {!notif.is_read && (
                    <Badge variant="secondary" size="sm" style={{ fontSize: "10px", padding: "1px 6px" }}>
                      Neu
                    </Badge>
                  )}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--font-size-xs, 13px)",
                    color: notif.is_read ? "var(--color-admin-muted, #94a3b8)" : "#e2e8f0",
                    lineHeight: 1.5,
                  }}
                >
                  {notif.summary || notif.message || "—"}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "4px",
                    fontSize: "11px",
                    color: "var(--color-admin-muted, #94a3b8)",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{formatDate(notif.created_at)}</span>

                  {typeCfg.targetRoute && (
                    <Link
                      to={typeCfg.targetRoute}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--color-primary, #C5A059)",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      <Icon name="external-link" size={11} />
                      <span>{typeCfg.targetLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {/* Toggle Read/Unread */}
              <Button
                variant={notif.is_read ? "ghost" : "outline"}
                size="sm"
                disabled={isUpdating}
                onClick={() => onToggleRead?.(notif.id, notif.is_read)}
                title={notif.is_read ? t("markAsUnread") : t("markAsRead")}
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  height: "28px",
                  color: notif.is_read ? "var(--color-admin-muted, #94a3b8)" : "var(--color-primary, #C5A059)",
                }}
              >
                <Icon name={notif.is_read ? "clock" : "check"} size={12} />
                <span className="hide-mobile">
                  {notif.is_read ? t("markAsUnread") : t("markAsRead")}
                </span>
              </Button>

              {/* View Detail Drawer */}
              <IconButton
                icon="eye"
                size="sm"
                variant="ghost"
                ariaLabel={t("viewDetails", { defaultValue: "Details" })}
                title={t("viewDetails", { defaultValue: "Details" })}
                onClick={() => onSelectNotification?.(notif)}
                style={{ width: "28px", height: "28px" }}
              />

              {/* Dismiss / Delete with Confirmation */}
              {!isDismissConfirm ? (
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  ariaLabel={t("dismiss", { defaultValue: "Verwerfen" })}
                  title={t("dismiss", { defaultValue: "Verwerfen" })}
                  onClick={() => setConfirmDismissId(notif.id)}
                  style={{
                    width: "28px",
                    height: "28px",
                    color: "var(--color-admin-muted, #94a3b8)",
                  }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleDismiss(notif.id)}
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      height: "26px",
                      backgroundColor: "var(--color-error, #ef4444)",
                      borderColor: "var(--color-error, #ef4444)",
                    }}
                  >
                    Verwerfen
                  </Button>
                  <IconButton
                    icon="x"
                    size="sm"
                    variant="ghost"
                    ariaLabel="Abbrechen"
                    onClick={() => setConfirmDismissId(null)}
                    style={{ width: "26px", height: "26px" }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NotificationList;
