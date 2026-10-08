import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import AdminEmptyState from "../AdminEmptyState";

function formatDateTime(isoString, lang = "en") {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-US", {
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
        className="role-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          color: "#d97706",
          border: "1px solid rgba(245, 158, 11, 0.35)",
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
        className="role-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          backgroundColor: "#e0f2fe",
          color: "#0284c7",
          border: "1px solid rgba(2, 132, 199, 0.2)",
        }}
      >
        <Icon name="shield" size={12} />
        ADMIN
      </span>
    );
  }

  return (
    <span
      className="role-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        backgroundColor: "var(--color-admin-border-subtle)",
        color: "var(--color-admin-muted)",
      }}
    >
      <Icon name="user" size={12} />
      CUSTOMER
    </span>
  );
}

function VerificationBadge({ isVerified, t }) {
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
        {t ? t("verified", { defaultValue: "Verified" }) : "Verified"}
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
      {t ? t("unverified", { defaultValue: "Unverified" }) : "Unverified"}
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
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "en";

  if (!loading && users.length === 0) {
    return (
      <AdminEmptyState
        title={t("noUsersFoundTitle", { defaultValue: "No users found" })}
        description={t("noUsersFoundDesc", {
          defaultValue: "No user accounts were found matching your criteria.",
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
                  backgroundColor: "var(--color-admin-border-subtle)",
                  color: "var(--color-admin-muted)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                <th style={{ padding: "14px 18px" }}>{t("tableFullName", { defaultValue: "FULL NAME" })}</th>
                <th style={{ padding: "14px 18px" }}>{t("tableEmail", { defaultValue: "EMAIL ADDRESS" })}</th>
                <th style={{ padding: "14px 18px" }}>{t("tableRole", { defaultValue: "ROLE" })}</th>
                <th style={{ padding: "14px 18px" }}>{t("tableStatus", { defaultValue: "STATUS" })}</th>
                <th style={{ padding: "14px 18px" }}>{t("tableCreatedDate", { defaultValue: "CREATED DATE" })}</th>
                <th style={{ padding: "14px 18px" }}>{t("tableUpdated", { defaultValue: "UPDATED" })}</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>{t("tableActions", { defaultValue: "ACTIONS" })}</th>
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
                      borderBottom: "1px solid var(--color-admin-border)",
                      backgroundColor: "transparent",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-admin-accent-subtle, rgba(37, 99, 235, 0.05))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isEven
                        ? "transparent"
                        : "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.015))";
                    }}
                  >
                    {/* Name */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          className="user-initial-circle"
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-admin-card, #ffffff)",
                            border: "1.5px solid var(--color-admin-border, #e2e8f0)",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-admin-accent, #2563eb)",
                            fontWeight: 800,
                            fontSize: "13px",
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-admin-accent, #2563eb)";
                            e.currentTarget.style.transform = "scale(1.08)";
                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(37, 99, 235, 0.18)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-admin-border, #e2e8f0)";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
                          }}
                        >
                          {(item.full_name || item.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-admin-text, #0f172a)" }}>
                            {item.full_name || "—"}
                          </div>
                          {isSelf && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--color-admin-accent)",
                                fontStyle: "italic",
                                fontWeight: 600,
                              }}
                            >
                              {" "}(You)
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
                      <VerificationBadge isVerified={item.is_verified} t={t} />
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
                      {formatDateTime(item.created_at, currentLang)}
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
                      {formatDateTime(item.updated_at, currentLang)}
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
                          ariaLabel={t("viewUserDetails", { defaultValue: "View details" })}
                          title={t("viewUserDetails", { defaultValue: "View details" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                        />

                        {/* Change Role */}
                        <IconButton
                          icon="shield"
                          ariaLabel={t("changeRole", { defaultValue: "Change role" })}
                          title={t("changeRole", { defaultValue: "Change role" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onChangeRole(item)}
                        />

                        {/* Revoke Sessions */}
                        <IconButton
                          icon="refresh-cw"
                          ariaLabel={t("revokeSessions", { defaultValue: "Revoke sessions" })}
                          title={t("revokeSessions", { defaultValue: "Revoke sessions" })}
                          variant="ghost"
                          size="sm"
                          onClick={() => onRevokeSessions(item)}
                        />

                        {/* Delete User */}
                        <IconButton
                          icon="trash"
                          ariaLabel={
                            isSelf
                              ? t("cannotDeleteOwnAccount", { defaultValue: "Cannot delete your own account" })
                              : t("deleteUser", { defaultValue: "Delete user" })
                          }
                          title={
                            isSelf
                              ? t("cannotDeleteOwnAccount", { defaultValue: "Cannot delete your own account" })
                              : t("deleteUser", { defaultValue: "Delete user" })
                          }
                          variant="ghost"
                          size="sm"
                          disabled={isSelf}
                          style={{
                            color: isSelf ? "var(--color-admin-muted)" : "var(--color-error, #ef4444)",
                            opacity: isSelf ? 0.35 : 1,
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
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {/* Card Header: Name, Self Indicator, Role */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-admin-card, #ffffff)",
                      border: "1.5px solid var(--color-admin-border, #e2e8f0)",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-admin-accent, #2563eb)",
                      fontWeight: 800,
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {(item.full_name || item.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "var(--color-admin-text, #0f172a)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.full_name || "—"}
                    </div>
                    {isSelf && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--color-admin-accent)",
                          fontStyle: "italic",
                          fontWeight: 600,
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <RoleBadge role={item.role} />
                </div>
              </div>

              {/* Email */}
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-admin-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <Icon name="mail" size={12} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  {item.email}
                </span>
              </div>

              {/* Status and Dates */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px",
                  padding: "6px 0",
                  borderTop: "1px solid var(--color-admin-border)",
                  borderBottom: "1px solid var(--color-admin-border)",
                  fontSize: "10px",
                  color: "var(--color-admin-muted)",
                }}
              >
                <VerificationBadge isVerified={item.is_verified} t={t} />
                <span style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                  {t("created", { defaultValue: "Created" })}: {formatDateTime(item.created_at, currentLang)}
                </span>
              </div>

              {/* Card Actions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  paddingTop: "4px",
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={() => onViewDetails(item)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    padding: "6px 2px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.03))",
                    border: "1px solid var(--color-admin-border)",
                    color: "var(--color-admin-text, #0f172a)",
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    minWidth: 0,
                  }}
                  title={t("viewDetails", { defaultValue: "Details" })}
                >
                  <Icon name="eye" size={14} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {t("viewDetails", { defaultValue: "Details" })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRole(item)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    padding: "6px 2px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.03))",
                    border: "1px solid var(--color-admin-border)",
                    color: "var(--color-admin-text, #0f172a)",
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    minWidth: 0,
                  }}
                  title={t("role", { defaultValue: "Role" })}
                >
                  <Icon name="shield" size={14} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {t("role", { defaultValue: "Role" })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onRevokeSessions(item)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    padding: "6px 2px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.03))",
                    border: "1px solid var(--color-admin-border)",
                    color: "var(--color-admin-text, #0f172a)",
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    minWidth: 0,
                  }}
                  title={t("sessions", { defaultValue: "Sessions" })}
                >
                  <Icon name="refresh-cw" size={14} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {t("sessions", { defaultValue: "Sessions" })}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => !isSelf && onDeleteUser(item)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    padding: "6px 2px",
                    borderRadius: "6px",
                    backgroundColor: isSelf ? "transparent" : "rgba(239, 68, 68, 0.08)",
                    border: isSelf ? "1px solid var(--color-admin-border)" : "1px solid rgba(239, 68, 68, 0.25)",
                    color: isSelf ? "var(--color-admin-muted)" : "var(--color-error, #ef4444)",
                    opacity: isSelf ? 0.35 : 1,
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: isSelf ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    minWidth: 0,
                  }}
                  title={
                    isSelf
                      ? t("cannotDeleteOwnAccount", { defaultValue: "Cannot delete your own account" })
                      : t("delete", { defaultValue: "Delete" })
                  }
                >
                  <Icon name="trash" size={14} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {t("delete", { defaultValue: "Delete" })}
                  </span>
                </button>
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
              defaultValue: "Page {{page}} of {{pages}} ({{total}} accounts)",
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
              <span>{t("previous", { defaultValue: "Previous" })}</span>
            </Button>

            <span
              style={{
                padding: "0 10px",
                fontWeight: 600,
                color: "var(--color-admin-text, #0f172a)",
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
              <span>{t("next", { defaultValue: "Next" })}</span>
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;
