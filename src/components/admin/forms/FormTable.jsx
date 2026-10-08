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
  const currentLang = i18n.language || "en";

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
        return { color: "#2563eb", bg: "rgba(37, 99, 235, 0.12)", border: "rgba(37, 99, 235, 0.3)" };
      case "READ":
        return { color: "#0891b2", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)" };
      case "IN_PROGRESS":
        return { color: "#d97706", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" };
      case "COMPLETED":
        return { color: "#16a34a", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.3)" };
      case "ARCHIVED":
        return { color: "#64748b", bg: "rgba(100, 116, 139, 0.12)", border: "rgba(100, 116, 139, 0.3)" };
      default:
        return { color: "var(--color-admin-text, #0f172a)", bg: "var(--color-admin-accent-subtle, rgba(0, 0, 0, 0.05))", border: "var(--color-admin-border, #e2e8f0)" };
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
          backgroundColor: "var(--color-admin-card, #ffffff)",
          borderRadius: "var(--radius-md, 8px)",
          border: "1px solid var(--color-admin-border, #e2e8f0)",
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
                borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
                backgroundColor: "var(--color-admin-border-subtle, #f8fafc)",
                color: "var(--color-admin-muted, #64748b)",
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 16px", width: "130px" }}>{t("columns.type", { defaultValue: "Type" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "170px" }}>{t("columns.sender", { defaultValue: "Sender" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "260px" }}>{t("submissionDetails", { defaultValue: "Subject / Vehicle" })}</th>
              <th style={{ padding: "12px 16px", width: "160px" }}>{t("columns.status", { defaultValue: "Status" })}</th>
              <th style={{ padding: "12px 16px", width: "150px" }}>{t("columns.date", { defaultValue: "Date" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "right", width: "130px" }}>{t("actions", { defaultValue: "Actions" })}</th>
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
                    borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-admin-accent-subtle, #f1f5f9)";
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
                          color: "#9333ea",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon name="message-square" size={11} />
                        {t("formTypeContact", { defaultValue: "Contact" })}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        size="sm"
                        style={{
                          backgroundColor: "rgba(249, 115, 22, 0.12)",
                          color: "#ea580c",
                          border: "1px solid rgba(249, 115, 22, 0.3)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon name="car" size={11} />
                        {t("formTypeSellCar", { defaultValue: "Sell Car" })}
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
                        color: "var(--color-admin-text, #0f172a)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={t("viewDetails", { defaultValue: "View Details" })}
                    >
                      <span>{senderName}</span>
                      {item.user_id && (
                        <span
                          title={t("registeredUser", { defaultValue: "Registered User" })}
                          style={{
                            fontSize: "10px",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: "var(--color-admin-accent-subtle, #e0f2fe)",
                            color: "var(--color-admin-accent, #0284c7)",
                            fontWeight: 600,
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
                          color: "var(--color-admin-muted, #64748b)",
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
                          color: "var(--color-admin-muted, #64748b)",
                          marginTop: "1px",
                        }}
                      >
                        {senderPhone}
                      </div>
                    )}
                  </td>

                  {/* Context: Subject & Preview (Contact) OR Vehicle specs (Sell) */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    {isContact ? (
                      <div>
                        {data.regarding && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--color-admin-accent, #0284c7)",
                              marginBottom: "3px",
                            }}
                          >
                            {data.regarding}
                          </div>
                        )}
                        <p
                          style={{
                            margin: 0,
                            color: "var(--color-admin-text, #334155)",
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
                            color: "var(--color-admin-text, #0f172a)",
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
                                borderColor: "var(--color-admin-border, #e2e8f0)",
                                color: "var(--color-admin-accent, #0284c7)",
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
                            color: "var(--color-admin-muted, #64748b)",
                          }}
                        >
                          {data.mileage_km != null && (
                            <span>{formatMileage(data.mileage_km)}</span>
                          )}
                          {data.first_registration && (
                            <span>EZ: {data.first_registration}</span>
                          )}
                          {data.min_price != null && (
                            <span style={{ color: "var(--color-admin-accent, #0284c7)", fontWeight: 600 }}>
                              {formatPrice(data.min_price)}
                            </span>
                          )}
                          {data.vin && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: "10px",
                                opacity: 0.85,
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
                        value={item.status || "NEW"}
                        disabled={isUpdatingThis}
                        aria-label={t("statusChangeAria", { defaultValue: "Change status" })}
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
                        <option value="NEW" style={{ backgroundColor: "#ffffff", color: "#2563eb" }}>
                          {t("statusNew", { defaultValue: "New" })}
                        </option>
                        <option value="READ" style={{ backgroundColor: "#ffffff", color: "#0891b2" }}>
                          {t("statusRead", { defaultValue: "Read" })}
                        </option>
                        <option value="IN_PROGRESS" style={{ backgroundColor: "#ffffff", color: "#d97706" }}>
                          {t("statusInProgress", { defaultValue: "In Progress" })}
                        </option>
                        <option value="COMPLETED" style={{ backgroundColor: "#ffffff", color: "#16a34a" }}>
                          {t("statusCompleted", { defaultValue: "Completed" })}
                        </option>
                        <option value="ARCHIVED" style={{ backgroundColor: "#ffffff", color: "#64748b" }}>
                          {t("statusArchived", { defaultValue: "Archived" })}
                        </option>
                      </select>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", color: "var(--color-admin-muted, #64748b)" }}>
                    <div>{formatDate(item.created_at)}</div>
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <div style={{ fontSize: "10px", opacity: 0.75, marginTop: "2px" }}>
                        {t("updatedShort", { defaultValue: "Updated" })}: {formatDate(item.updated_at)}
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
                        ariaLabel={t("viewDetails", { defaultValue: "View Details" })}
                        onClick={() => onViewDetail?.(item)}
                        title={t("viewDetails", { defaultValue: "View Details" })}
                        style={{ width: "30px", height: "30px" }}
                      />

                      {/* Quick Contact Link if available */}
                      {senderEmail && (
                        <a
                          href={`mailto:${encodeURIComponent(senderEmail)}?subject=${encodeURIComponent(
                            isContact
                              ? `German Auto: Your inquiry regarding ${data.regarding || "our services"}`
                              : `German Auto: Your vehicle ${data.brand || ""} ${data.model || ""}`
                          )}`}
                          title={`Email to ${senderEmail}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "30px",
                            height: "30px",
                            borderRadius: "var(--radius-sm, 4px)",
                            backgroundColor: "var(--color-admin-accent-subtle, #f1f5f9)",
                            color: "var(--color-admin-text, #0f172a)",
                            border: "1px solid var(--color-admin-border, #e2e8f0)",
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
                          ariaLabel={t("archive", { defaultValue: "Archive" })}
                          onClick={() => onArchive?.(item)}
                          title={t("archive", { defaultValue: "Archive" })}
                          style={{
                            width: "30px",
                            height: "30px",
                            color: "var(--color-admin-muted, #64748b)",
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
                backgroundColor: "var(--color-admin-card, #ffffff)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
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
                        color: "#9333ea",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      <Icon name="message-square" size={11} /> {t("formTypeContact", { defaultValue: "Contact" })}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      size="sm"
                      style={{
                        backgroundColor: "rgba(249, 115, 22, 0.12)",
                        color: "#ea580c",
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                      }}
                    >
                      <Icon name="car" size={11} /> {t("formTypeSellCar", { defaultValue: "Sell Car" })}
                    </Badge>
                  )}

                  <select
                    value={item.status || "NEW"}
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
                    <option value="NEW">{t("statusNew", { defaultValue: "New" })}</option>
                    <option value="READ">{t("statusRead", { defaultValue: "Read" })}</option>
                    <option value="IN_PROGRESS">{t("statusInProgress", { defaultValue: "In Progress" })}</option>
                    <option value="COMPLETED">{t("statusCompleted", { defaultValue: "Completed" })}</option>
                    <option value="ARCHIVED">{t("statusArchived", { defaultValue: "Archived" })}</option>
                  </select>
                </div>

                <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* Submitter & Context */}
              <div>
                <div
                  style={{
                    fontSize: "var(--font-size-base, 15px)",
                    fontWeight: 700,
                    color: "var(--color-admin-text, #0f172a)",
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
                        backgroundColor: "var(--color-admin-accent-subtle, #e0f2fe)",
                        color: "var(--color-admin-accent, #0284c7)",
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
                          color: "var(--color-admin-accent, #0284c7)",
                          marginBottom: "2px",
                        }}
                      >
                        {data.regarding}
                      </div>
                    )}
                    <p
                      style={{
                        margin: 0,
                        color: "var(--color-admin-muted, #64748b)",
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
                        color: "var(--color-admin-text, #0f172a)",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{`${data.brand || ""} ${data.model || ""}`.trim() || "—"}</span>
                      {Array.isArray(data.images) && data.images.length > 0 && (
                        <span style={{ fontSize: "11px", color: "var(--color-admin-accent, #0284c7)" }}>
                          ({data.images.length} photos)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        fontSize: "11px",
                        color: "var(--color-admin-muted, #64748b)",
                        marginTop: "2px",
                      }}
                    >
                      {data.mileage_km != null && <span>{formatMileage(data.mileage_km)}</span>}
                      {data.first_registration && <span>EZ: {data.first_registration}</span>}
                      {data.min_price != null && (
                        <span style={{ color: "var(--color-admin-accent, #0284c7)", fontWeight: 600 }}>
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
                  borderTop: "1px solid var(--color-admin-border, #e2e8f0)",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {senderEmail && (
                    <a
                      href={`mailto:${encodeURIComponent(senderEmail)}`}
                      title={`Email to ${senderEmail}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "var(--color-admin-accent-subtle, #f1f5f9)",
                        color: "var(--color-admin-text, #0f172a)",
                        border: "1px solid var(--color-admin-border, #e2e8f0)",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="mail" size={14} />
                    </a>
                  )}

                  {senderPhone && (
                    <a
                      href={`tel:${senderPhone}`}
                      title={`Call: ${senderPhone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "rgba(34, 197, 94, 0.12)",
                        color: "#16a34a",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
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
                      title="WhatsApp Chat"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm, 4px)",
                        backgroundColor: "rgba(37, 211, 102, 0.15)",
                        color: "#16a34a",
                        border: "1px solid rgba(37, 211, 102, 0.3)",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="whatsapp" size={14} />
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
                        color: "var(--color-admin-muted, #64748b)",
                        fontSize: "11px",
                        padding: "4px 8px",
                      }}
                    >
                      <Icon name="archive" size={12} /> {t("archive", { defaultValue: "Archive" })}
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
