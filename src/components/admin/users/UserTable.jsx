import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import AdminEmptyState from "../AdminEmptyState";

function formatDateTime(isoString) {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

function RoleBadge({ role }) {
  if (role === "SUPER_ADMIN") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 9px",
          borderRadius: "var(--radius-sm)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          backgroundColor: "rgba(197, 160, 89, 0.16)",
          color: "var(--color-secondary)",
          border: "1px solid rgba(197, 160, 89, 0.4)",
        }}
      >
        <Icon name="award" size={12} />
        SUPER ADMIN
      </span>
    );
  }

  if (role === "ADMIN") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 9px",
          borderRadius: "var(--radius-sm)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          backgroundColor: "rgba(59, 130, 246, 0.14)",
          color: "#60a5fa",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        }}
      >
        <Icon name="shield" size={12} />
        ADMIN
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "var(--radius-sm)",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        color: "var(--color-admin-muted)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <Icon name="user" size={12} />
      CUSTOMER
    </span>
  );
}

function VerificationBadge({ isVerified }) {
  if (isVerified) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          color: "#4ade80",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        <Icon name="check" size={14} />
        Verifiziert
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color: "#fbbf24",
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      <Icon name="alert-circle" size={14} />
      Unverifiziert
    </span>
  );
}

export function UserTable({
  users = [],
  currentUserId,
  pagination = { page: 1, pages: 1, total: 0, limit: 20 },
  onPageChange,
  onViewDetails,
  onChangeRole,
  onRevokeSessions,
  onDeleteUser,
  loading = false,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  if (!loading && users.length === 0) {
    return (
      <AdminEmptyState
        title={t("noUsersFoundTitle", { defaultValue: "Keine Benutzer gefunden" })}
        description={t("noUsersFoundDesc", {
          defaultValue: "Es wurden keine Benutzerkonten gefunden, die Ihren Kriterien entsprechen.",
        })}
        icon="users"
      />
    );
  }

  return (
    <div
      className={`admin-user-table-wrapper ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      {/* ─── DESKTOP TABLE VIEW (Screens >= 900px) ─────────────────────────── */}
      <div
        className="hide-mobile"
        style={{
          backgroundColor: "var(--color-admin-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-admin-border)",
          overflow: "hidden",
          boxShadow: "var(--shadow-elevation-1)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-admin-border)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  color: "var(--color-admin-muted)",
                  fontSize: "var(--font-size-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("name", { defaultValue: "Name" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("email", { defaultValue: "E-Mail" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("role", { defaultValue: "Rolle" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("status", { defaultValue: "Status" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("created", { defaultValue: "Erstellt" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>{t("updated", { defaultValue: "Aktualisiert" })}</th>
                <th style={{ padding: "14px 18px", fontWeight: 600, textAlign: "right" }}>
                  {t("actions", { defaultValue: "Aktionen" })}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((item, index) => {
                const isSelf = item.id === currentUserId;
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      backgroundColor: isEven ? "transparent" : "rgba(255, 255, 255, 0.015)",
                      transition: "background-color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isEven
                        ? "transparent"
                        : "rgba(255, 255, 255, 0.015)";
                    }}
                  >
                    {/* Name */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-admin-text)",
                            fontWeight: 700,
                            fontSize: "12px",
                            flexShrink: 0,
                          }}
                        >
                          {(item.full_name || item.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-admin-text)" }}>
                            {item.full_name || "—"}
                          </div>
                          {isSelf && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: "var(--color-secondary)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              (Sie / Ihr Konto)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      style={{
                        padding: "14px 18px",
                        color: "var(--color-admin-muted)",
                        wordBreak: "break-all",
                        maxWidth: "240px",
                      }}
                    >
                      {item.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 18px" }}>
                      <RoleBadge role={item.role} />
                    </td>

                    {/* Verification Status */}
                    <td style={{ padding: "14px 18px" }}>
                      <VerificationBadge isVerified={item.is_verified} />
                    </td>

                    {/* Created Date */}
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-admin-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateTime(item.created_at)}
                    </td>

                    {/* Updated Date */}
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-admin-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateTime(item.updated_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {/* View Details */}
                        <IconButton
                          icon="eye"
                          ariaLabel={t("viewUserDetails", { defaultValue: "Details anzeigen" })}
                          title={t("viewUserDetails", { defaultValue: "Details anzeigen" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                        />

                        {/* Change Role */}
                        <IconButton
                          icon="shield"
                          ariaLabel={t("changeRole", { defaultValue: "Rolle ändern" })}
                          title={t("changeRole", { defaultValue: "Rolle ändern" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onChangeRole(item)}
                        />

                        {/* Revoke Sessions */}
                        <IconButton
                          icon="refresh-cw"
                          ariaLabel={t("revokeSessions", { defaultValue: "Sitzungen beenden" })}
                          title={t("revokeSessions", { defaultValue: "Sitzungen beenden" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onRevokeSessions(item)}
                        />

                        {/* Delete User */}
                        <IconButton
                          icon="trash"
                          ariaLabel={
                            isSelf
                              ? t("cannotDeleteOwnAccount", { defaultValue: "Eigenes Konto kann nicht gelöscht werden" })
                              : t("deleteUser", { defaultValue: "Benutzer löschen" })
                          }
                          title={
                            isSelf
                              ? t("cannotDeleteOwnAccount", { defaultValue: "Eigenes Konto kann nicht gelöscht werden" })
                              : t("deleteUser", { defaultValue: "Benutzer löschen" })
                          }
                          variant="ghost"
                          size="sm"
                          disabled={isSelf}
                          style={{
                            color: isSelf ? "rgba(255, 255, 255, 0.2)" : "var(--color-error)",
                            cursor: isSelf ? "not-allowed" : "pointer",
                          }}
                          onClick={() => !isSelf && onDeleteUser(item)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MOBILE / TABLET CARD VIEW (Screens < 900px) ────────────────────── */}
      <div
        className="hide-desktop"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
        }}
      >
        {users.map((item) => {
          const isSelf = item.id === currentUserId;

          return (
            <div
              key={item.id}
              className="surface-card"
              style={{
                backgroundColor: "var(--color-admin-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-admin-border)",
                padding: "var(--space-md)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              {/* Card Header: Name, Self Indicator, Role */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "var(--space-sm)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--font-size-base)", color: "var(--color-admin-text)" }}>
                    {item.full_name || "—"}
                  </div>
                  {isSelf && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--color-secondary)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      (Sie / Ihr Konto)
                    </span>
                  )}
                </div>
                <RoleBadge role={item.role} />
              </div>

              {/* Email */}
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-admin-muted)",
                  wordBreak: "break-all",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon name="mail" size={14} />
                <span>{item.email}</span>
              </div>

              {/* Status and Dates */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-xs)",
                  padding: "8px 0",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  fontSize: "11px",
                  color: "var(--color-admin-muted)",
                }}
              >
                <VerificationBadge isVerified={item.is_verified} />
                <span>Erstellt: {formatDateTime(item.created_at)}</span>
              </div>

              {/* Card Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "var(--space-xs)",
                  paddingTop: "4px",
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                >
                  <Icon name="eye" size={14} />
                  <span style={{ marginLeft: "4px" }}>Details</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeRole(item)}
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                >
                  <Icon name="shield" size={14} />
                  <span style={{ marginLeft: "4px" }}>Rolle</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevokeSessions(item)}
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                >
                  <Icon name="refresh-cw" size={14} />
                  <span style={{ marginLeft: "4px" }}>Sitzungen</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isSelf}
                  onClick={() => !isSelf && onDeleteUser(item)}
                  style={{
                    fontSize: "12px",
                    padding: "6px 10px",
                    color: isSelf ? "rgba(255, 255, 255, 0.2)" : "var(--color-error)",
                  }}
                >
                  <Icon name="trash" size={14} />
                  <span style={{ marginLeft: "4px" }}>{t("delete")}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SERVER-SIDE PAGINATION CONTROLS ─────────────────────────────────── */}
      {pagination.pages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            padding: "var(--space-md) var(--space-lg)",
            backgroundColor: "var(--color-admin-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-admin-border)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-admin-muted)",
          }}
        >
          <div>
            {t("paginationInfo", {
              page: pagination.page,
              pages: pagination.pages,
              total: pagination.total,
              defaultValue: "Seite {{page}} von {{pages}} ({{total}} Konten)",
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="chevron-left" size={14} />
              <span>{t("previous", { defaultValue: "Zurück" })}</span>
            </Button>

            <span
              style={{
                padding: "0 10px",
                fontWeight: 600,
                color: "var(--color-admin-text)",
              }}
            >
              {pagination.page} / {pagination.pages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => onPageChange(pagination.page + 1)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>{t("next", { defaultValue: "Weiter" })}</span>
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;
