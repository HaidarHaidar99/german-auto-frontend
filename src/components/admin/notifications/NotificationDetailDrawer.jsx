import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

export function NotificationDetailDrawer({
  isOpen,
  notification = null,
  onClose,
  onToggleRead,
  onDismiss,
  updatingId = null,
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";

  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  if (!notification) return null;

  const isUpdating = updatingId === notification.id;

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
          border: "rgba(168, 85, 247, 0.3)",
          targetRoute: "/admincoresecure/forms",
          targetLabel: t("openInForms", { defaultValue: "In Formularverwaltung öffnen" }),
        };
      case "SELL_CAR_FORM":
        return {
          label: t("filterSellCarForms", { defaultValue: "Fahrzeugankauf" }),
          icon: "car",
          color: "#f97316",
          bg: "rgba(249, 115, 22, 0.12)",
          border: "rgba(249, 115, 22, 0.3)",
          targetRoute: "/admincoresecure/forms",
          targetLabel: t("openInForms", { defaultValue: "In Formularverwaltung öffnen" }),
        };
      case "NEW_REVIEW":
        return {
          label: t("filterReviews", { defaultValue: "Kundenbewertung" }),
          icon: "star",
          color: "#06b6d4",
          bg: "rgba(6, 182, 212, 0.12)",
          border: "rgba(6, 182, 212, 0.3)",
          targetRoute: "/admincoresecure/reviews",
          targetLabel: t("openInReviews", { defaultValue: "In Bewertungsmoderation öffnen" }),
        };
      default:
        return {
          label: t("filterSystem", { defaultValue: "Systemmeldung" }),
          icon: "bell",
          color: "var(--color-primary, #C5A059)",
          bg: "rgba(197, 160, 89, 0.12)",
          border: "rgba(197, 160, 89, 0.3)",
          targetRoute: null,
          targetLabel: null,
        };
    }
  };

  const typeCfg = getTypeConfig(notification.type);

  const handleDismissClick = async () => {
    if (isUpdating) return;
    await onDismiss?.(notification.id);
    setShowDismissConfirm(false);
    onClose?.();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("notificationDetails", { defaultValue: "Benachrichtigungs-Details" })}
      size="md"
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
            gap: "var(--space-sm, 12px)",
          }}
        >
          {/* Dismiss Action with confirmation guard */}
          <div>
            {!showDismissConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={isUpdating}
                onClick={() => setShowDismissConfirm(true)}
                style={{
                  color: "var(--color-admin-muted, #94a3b8)",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon name="x" size={14} />
                <span>{t("dismiss", { defaultValue: "Verwerfen" })}</span>
              </Button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={handleDismissClick}
                  style={{
                    backgroundColor: "var(--color-error, #ef4444)",
                    borderColor: "var(--color-error, #ef4444)",
                    fontSize: "11px",
                  }}
                >
                  {t("confirmReset", { defaultValue: "Ja, verwerfen" })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDismissConfirm(false)}
                  style={{ fontSize: "11px" }}
                >
                  {t("cancel", { defaultValue: "Abbrechen" })}
                </Button>
              </div>
            )}
          </div>

          {/* Toggle Read/Unread & Close */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant={notification.is_read ? "secondary" : "primary"}
              size="sm"
              disabled={isUpdating}
              onClick={() => onToggleRead?.(notification.id, notification.is_read)}
              style={{ fontSize: "12px" }}
            >
              <Icon name={notification.is_read ? "clock" : "check"} size={13} />
              <span>
                {notification.is_read
                  ? t("markAsUnread", { defaultValue: "Als ungelesen markieren" })
                  : t("markAsRead", { defaultValue: "Als gelesen markieren" })}
              </span>
            </Button>

            <Button variant="secondary" size="sm" onClick={onClose} style={{ fontSize: "12px" }}>
              {t("close", { defaultValue: "Schließen" })}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg, 20px)" }}>
        {/* Banner with Type & State */}
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: typeCfg.bg,
            border: `1px solid ${typeCfg.border}`,
            borderRadius: "var(--radius-md, 8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm, 6px)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: typeCfg.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={typeCfg.icon} size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: typeCfg.color }}>
                {typeCfg.label}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)", marginTop: "1px" }}>
                {formatDate(notification.created_at)}
              </div>
            </div>
          </div>

          <Badge variant={notification.is_read ? "neutral" : "secondary"} size="sm">
            {notification.is_read ? t("filterRead", { defaultValue: "Gelesen" }) : t("filterUnread", { defaultValue: "Ungelesen" })}
          </Badge>
        </div>

        {/* Message Content Card */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--color-admin-card, #121418)",
            border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            borderRadius: "var(--radius-md, 8px)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-base, 16px)",
              fontWeight: 700,
              color: "var(--color-admin-text, #ffffff)",
            }}
          >
            {notification.title}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm, 14px)",
              color: "var(--color-admin-text, #e2e8f0)",
              lineHeight: 1.6,
            }}
          >
            {notification.summary || notification.message || "—"}
          </p>
        </div>

        {/* Source Reference Information */}
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: "var(--color-admin-card, #121418)",
            border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            borderRadius: "var(--radius-md, 8px)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-admin-muted, #94a3b8)" }}>
            Herkunft & Referenz
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ color: "var(--color-admin-muted, #94a3b8)" }}>Quelle:</span>
            <Badge variant="outline" size="sm">
              {notification.source_type === "forms" ? t("sourceForms", { defaultValue: "Formulare" }) : t("sourceReviews", { defaultValue: "Bewertungen" })}
            </Badge>
          </div>

          {notification.source_record_id && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ color: "var(--color-admin-muted, #94a3b8)" }}>{t("sourceRecord", { defaultValue: "Datensatz-ID" })}:</span>
              <code style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-primary, #C5A059)" }}>
                {notification.source_record_id}
              </code>
            </div>
          )}

          {/* Direct Navigation Button */}
          {typeCfg.targetRoute && (
            <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", marginTop: "4px" }}>
              <Link
                to={typeCfg.targetRoute}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(197, 160, 89, 0.12)",
                  border: "1px solid var(--color-primary, #C5A059)",
                  borderRadius: "var(--radius-sm, 6px)",
                  color: "var(--color-primary, #C5A059)",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Icon name="external-link" size={14} />
                <span>{typeCfg.targetLabel}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default NotificationDetailDrawer;
