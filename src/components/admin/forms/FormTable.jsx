import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../../ui/Badge";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import Button from "../../ui/Button";

export function FormTable({
  forms = [],
  onViewDetail,
  onChangeStatus,
  onArchive,
  updatingStatusId = null,
  className = "",
  style = {},
}) {
  const { t, i18n } = useTranslation(["admin", "forms", "common"]);
  const currentLang = i18n.language || "de";

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

  const formatPrice = (price) => {
    if (price == null || price === "") return null;
    return new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatMileage = (km) => {
    if (km == null || km === "") return null;
    return `${new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-US").format(Number(km))} km`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW":
        return { color: "#60a5fa", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" };
      case "READ":
        return { color: "#22d3ee", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)" };
      case "IN_PROGRESS":
        return { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" };
      case "COMPLETED":
        return { color: "#4ade80", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.3)" };
      case "ARCHIVED":
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.3)" };
      default:
        return { color: "#e2e8f0", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" };
    }
  };


  const sanitizePhoneForWa = (phone) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  return (
    <div className={`form-table-wrapper ${className}`.trim()} style={{ width: "100%", ...style }}>
      {/* ─── Desktop Table View (>= 1024px) ─── */}
      <div
        className="form-desktop-table-container"
        style={{
          width: "100%",
          overflowX: "auto",
          backgroundColor: "var(--color-admin-card, #121418)",
          borderRadius: "var(--radius-md, 8px)",
          border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "var(--font-size-xs, 12px)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                color: "var(--color-admin-muted, #94a3b8)",
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 16px", width: "130px" }}>{t("columns.type", { defaultValue: "Typ" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "170px" }}>{t("columns.sender", { defaultValue: "Absender" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "260px" }}>{t("submissionDetails", { defaultValue: "Betreff / Fahrzeug" })}</th>
              <th style={{ padding: "12px 16px", width: "160px" }}>{t("columns.status", { defaultValue: "Status" })}</th>
              <th style={{ padding: "12px 16px", width: "150px" }}>{t("columns.date", { defaultValue: "Eingangsdatum" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "right", width: "130px" }}>{t("actions", { defaultValue: "Aktionen" })}</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((item) => {
              const isContact = item.form_type === "CONTACT";
              const data = item.data || {};
              const senderName = isContact
                ? data.name || item.name || "—"
                : `${data.first_name || ""} ${data.last_name || ""}`.trim() || "—";
              const senderEmail = data.email || item.email || "";
              const senderPhone = data.phone || item.phone || "";
              const statusCfg = getStatusColor(item.status);
              const isUpdatingThis = updatingStatusId === item.id;

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Type Badge */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    {isContact ? (
                      <Badge
                        variant="secondary"
                        size="sm"
                        style={{
                          backgroundColor: "rgba(168, 85, 247, 0.12)",
                          color: "#c084fc",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon name="message-square" size={11} />
                        {t("formTypeContact", { defaultValue: "Kontakt" })}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        size="sm"
                        style={{
                          backgroundColor: "rgba(249, 115, 22, 0.12)",
                          color: "#fb923c",
                          border: "1px solid rgba(249, 115, 22, 0.3)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon name="car" size={11} />
                        {t("formTypeSellCar", { defaultValue: "Ankauf" })}
                      </Badge>
                    )}
                  </td>

                  {/* Sender Contact Info */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onViewDetail?.(item)}
                      onKeyDown={(e) => e.key === "Enter" && onViewDetail?.(item)}
                      style={{
                        fontWeight: 600,
                        color: "var(--color-admin-text, #ffffff)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={t("viewDetails", { defaultValue: "Details anzeigen" })}
                    >
                      <span>{senderName}</span>
                      {item.user_id && (
                        <span
                          title={t("registeredUser", { defaultValue: "Registrierter Benutzer" })}
                          style={{
                            fontSize: "10px",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: "rgba(197, 160, 89, 0.15)",
                            color: "var(--color-primary, #C5A059)",
                          }}
                        >
                          User
                        </span>
                      )}
                    </div>
                    {senderEmail && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-admin-muted, #94a3b8)",
                          marginTop: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                        title={senderEmail}
                      >
                        {senderEmail}
                      </div>
                    )}
                    {senderPhone && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-admin-muted, #94a3b8)",
                          marginTop: "1px",
                        }}
                      >
                        {senderPhone}
                      </div>
                    )}
                  </td>

                  {/* Details / Vehicle / Message */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", maxWidth: "340px" }}>
                    {isContact ? (
                      <div>
                        {data.regarding && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--color-primary, #C5A059)",
                              marginBottom: "3px",
                            }}
                          >
                            {data.regarding}
                          </div>
                        )}
                        <p
                          style={{
                            margin: 0,
                            color: "var(--color-admin-muted, #cbd5e1)",
                            fontSize: "12px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "320px",
                          }}
                          title={data.message || ""}
                        >
                          {data.message || "—"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--color-admin-text, #ffffff)",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>{`${data.brand || ""} ${data.model || ""}`.trim() || "—"}</span>
                          {Array.isArray(data.images) && data.images.length > 0 && (
                            <Badge
                              variant="outline"
                              size="sm"
                              style={{
                                fontSize: "10px",
                                padding: "1px 5px",
                                borderColor: "rgba(197, 160, 89, 0.4)",
                                color: "var(--color-primary, #C5A059)",
                              }}
                            >
                              📸 {data.images.length}
                            </Badge>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "3px",
                            flexWrap: "wrap",
                            fontSize: "11px",
                            color: "var(--color-admin-muted, #94a3b8)",
                          }}
                        >
                          {data.mileage_km != null && (
                            <span>{formatMileage(data.mileage_km)}</span>
                          )}
                          {data.first_registration && (
                            <span>EZ: {data.first_registration}</span>
                          )}
                          {data.min_price != null && (
                            <span style={{ color: "var(--color-primary, #C5A059)", fontWeight: 600 }}>
                              {formatPrice(data.min_price)}
                            </span>
                          )}
                          {data.vin && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: "10px",
                                opacity: 0.75,
                              }}
                              title={`VIN: ${data.vin}`}
                            >
                              {data.vin.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <select
                        value={item.status}
                        disabled={isUpdatingThis}
                        aria-label={t("statusChangeAria", { defaultValue: "Status ändern" })}
                        onChange={(e) => onChangeStatus?.(item.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm, 4px)",
                          border: `1px solid ${statusCfg.border}`,
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          cursor: isUpdatingThis ? "not-allowed" : "pointer",
                          outline: "none",
                          opacity: isUpdatingThis ? 0.6 : 1,
                        }}
                      >
                        <option value="NEW" style={{ backgroundColor: "#121418", color: "#60a5fa" }}>
                          {t("statusNew", { defaultValue: "Neu" })}
                        </option>
                        <option value="READ" style={{ backgroundColor: "#121418", color: "#22d3ee" }}>
                          {t("statusRead", { defaultValue: "Gelesen" })}
                        </option>
                        <option value="IN_PROGRESS" style={{ backgroundColor: "#121418", color: "#fbbf24" }}>
                          {t("statusInProgress", { defaultValue: "In Bearbeitung" })}
                        </option>
                        <option value="COMPLETED" style={{ backgroundColor: "#121418", color: "#4ade80" }}>
                          {t("statusCompleted", { defaultValue: "Abgeschlossen" })}
                        </option>
                        <option value="ARCHIVED" style={{ backgroundColor: "#121418", color: "#94a3b8" }}>
                          {t("statusArchived", { defaultValue: "Archiviert" })}
                        </option>
                      </select>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", color: "var(--color-admin-muted, #94a3b8)" }}>
                    <div>{formatDate(item.created_at)}</div>
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <div style={{ fontSize: "10px", opacity: 0.65, marginTop: "2px" }}>
                        {t("updatedShort", { defaultValue: "Aktualisiert" })}: {formatDate(item.updated_at)}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right", verticalAlign: "middle" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {/* View Detail Drawer */}
                      <IconButton
                        icon="eye"
                        size="sm"
                        variant="secondary"
                        ariaLabel={t("viewDetails", { defaultValue: "Details anzeigen" })}
                        onClick={() => onViewDetail?.(item)}
                        title={t("viewDetails", { defaultValue: "Details anzeigen" })}
                        style={{ width: "30px", height: "30px" }}
                      />

                      {/* Quick Contact Link if available */}
                      {senderEmail && (
                        <a
                          href={`mailto:${encodeURIComponent(senderEmail)}?subject=${encodeURIComponent(
                            isContact
                              ? `German Auto: Ihre Anfrage bezüglich ${data.regarding || "unseren Service"}`
                              : `German Auto: Ihr Fahrzeug ${data.brand || ""} ${data.model || ""}`
                          )}`}
                          title={`E-Mail an ${senderEmail}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "30px",
                            height: "30px",
                            borderRadius: "var(--radius-sm, 4px)",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: "var(--color-admin-text, #ffffff)",
                            border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                            textDecoration: "none",
                            transition: "background-color 0.2s",
                          }}
                        >
                          <Icon name="mail" size={14} />
                        </a>
                      )}

                      {/* Archive Button */}
                      {item.status !== "ARCHIVED" && (
                        <IconButton
                          icon="archive"
                          size="sm"
                          variant="ghost"
                          ariaLabel={t("archive", { defaultValue: "Archivieren" })}
                          onClick={() => onArchive?.(item)}
                          title={t("archive", { defaultValue: "Archivieren" })}
                          style={{
                            width: "30px",
                            height: "30px",
                            color: "var(--color-admin-muted, #94a3b8)",
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile & Tablet Card List (< 1024px) ─── */}
      <div
        className="form-mobile-card-list"
        style={{
          display: "none",
          flexDirection: "column",
          gap: "var(--space-md, 16px)",
        }}
      >
        {forms.map((item) => {
          const isContact = item.form_type === "CONTACT";
          const data = item.data || {};
          const senderName = isContact
            ? data.name || item.name || "—"
            : `${data.first_name || ""} ${data.last_name || ""}`.trim() || "—";
          const senderEmail = data.email || item.email || "";
          const senderPhone = data.phone || item.phone || "";
          const statusCfg = getStatusColor(item.status);
          const isUpdatingThis = updatingStatusId === item.id;
          const cleanWa = sanitizePhoneForWa(senderPhone);

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: "var(--color-admin-card, #121418)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                padding: "var(--space-md, 16px)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm, 12px)",
              }}
            >
              {/* Card Header: Type, Status, Date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {isContact ? (
                    <Badge
                      variant="secondary"
                      size="sm"
                      style={{
                        backgroundColor: "rgba(168, 85, 247, 0.12)",
                        color: "#c084fc",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      <Icon name="message-square" size={11} /> {t("formTypeContact", { defaultValue: "Kontakt" })}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      size="sm"
                      style={{
                        backgroundColor: "rgba(249, 115, 22, 0.12)",
                        color: "#fb923c",
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                      }}
                    >
                      <Icon name="car" size={11} /> {t("formTypeSellCar", { defaultValue: "Ankauf" })}
                    </Badge>
                  )}

                  <select
                    value={item.status}
                    disabled={isUpdatingThis}
                    onChange={(e) => onChangeStatus?.(item.id, e.target.value)}
                    style={{
                      padding: "2px 6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "var(--radius-sm, 4px)",
                      border: `1px solid ${statusCfg.border}`,
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="NEW" style={{ backgroundColor: "#121418", color: "#60a5fa" }}>
                      {t("statusNew", { defaultValue: "Neu" })}
                    </option>
                    <option value="READ" style={{ backgroundColor: "#121418", color: "#22d3ee" }}>
                      {t("statusRead", { defaultValue: "Gelesen" })}
                    </option>
                    <option value="IN_PROGRESS" style={{ backgroundColor: "#121418", color: "#fbbf24" }}>
                      {t("statusInProgress", { defaultValue: "In Bearbeitung" })}
                    </option>
                    <option value="COMPLETED" style={{ backgroundColor: "#121418", color: "#4ade80" }}>
                      {t("statusCompleted", { defaultValue: "Abgeschlossen" })}
                    </option>
                    <option value="ARCHIVED" style={{ backgroundColor: "#121418", color: "#94a3b8" }}>
                      {t("statusArchived", { defaultValue: "Archiviert" })}
                    </option>
                  </select>
                </div>

                <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)" }}>
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* Submitter & Context */}
              <div>
                <div
                  style={{
                    fontSize: "var(--font-size-base, 15px)",
                    fontWeight: 700,
                    color: "var(--color-admin-text, #ffffff)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{senderName}</span>
                  {item.user_id && (
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        backgroundColor: "rgba(197, 160, 89, 0.15)",
                        color: "var(--color-primary, #C5A059)",
                      }}
                    >
                      User
                    </span>
                  )}
                </div>

                {isContact ? (
                  <div style={{ marginTop: "6px" }}>
                    {data.regarding && (
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--color-primary, #C5A059)",
                          marginBottom: "2px",
                        }}
                      >
                        {data.regarding}
                      </div>
                    )}
                    <p
                      style={{
                        margin: 0,
                        color: "var(--color-admin-muted, #94a3b8)",
                        fontSize: "12px",
                        lineHeight: 1.4,
                      }}
                    >
                      {data.message ? (data.message.length > 140 ? `${data.message.slice(0, 140)}...` : data.message) : "—"}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: "6px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--color-admin-text, #ffffff)",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{`${data.brand || ""} ${data.model || ""}`.trim() || "—"}</span>
                      {Array.isArray(data.images) && data.images.length > 0 && (
                        <span style={{ fontSize: "11px", color: "var(--color-primary, #C5A059)" }}>
                          ({data.images.length} Fotos)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        fontSize: "11px",
                        color: "var(--color-admin-muted, #94a3b8)",
                        marginTop: "2px",
                      }}
                    >
                      {data.mileage_km != null && <span>{formatMileage(data.mileage_km)}</span>}
                      {data.first_registration && <span>EZ: {data.first_registration}</span>}
                      {data.min_price != null && (
                        <span style={{ color: "var(--color-primary, #C5A059)", fontWeight: 600 }}>
                          {formatPrice(data.min_price)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information & Action Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-xs, 8px)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {senderEmail && (
                    <a
                      href={`mailto:${encodeURIComponent(senderEmail)}`}
                      title={`E-Mail an ${senderEmail}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        color: "#ffffff",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="mail" size={14} />
                    </a>
                  )}

                  {senderPhone && (
                    <a
                      href={`tel:${senderPhone}`}
                      title={`Anrufen: ${senderPhone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        color: "#22c55e",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="phone" size={14} />
                    </a>
                  )}

                  {cleanWa && (
                    <a
                      href={`https://wa.me/${cleanWa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp Chat starten"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "rgba(37, 211, 102, 0.15)",
                        color: "#25D366",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="message-circle" size={14} />
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.status !== "ARCHIVED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive?.(item)}
                      style={{
                        color: "var(--color-admin-muted, #94a3b8)",
                        fontSize: "11px",
                        padding: "4px 8px",
                      }}
                    >
                      <Icon name="archive" size={12} /> {t("archive", { defaultValue: "Archivieren" })}
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewDetail?.(item)}
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    <Icon name="eye" size={12} /> {t("viewDetails", { defaultValue: "Details" })}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .form-desktop-table-container {
            display: none !important;
          }
          .form-mobile-card-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FormTable;
