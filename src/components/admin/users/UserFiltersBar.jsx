import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";
import Button from "../../ui/Button";

export function UserFiltersBar({
  filters,
  onChange,
  onReset,
  totalResults = 0,
  loading = false,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.role !== "ALL" ||
    filters.is_verified !== "ALL";

  return (
    <div
      className={`admin-user-filters-bar surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-admin-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-admin-border)",
        padding: "var(--space-md) var(--space-lg)",
        marginBottom: "var(--space-xl)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-md)",
          justifyContent: "space-between",
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: "relative",
            flex: "1 1 280px",
            minWidth: "220px",
            maxWidth: "420px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-admin-muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={t("searchUsersPlaceholder", { defaultValue: "Name oder E-Mail suchen..." })}
            aria-label={t("searchUsersPlaceholder", { defaultValue: "Name oder E-Mail suchen..." })}
            style={{
              width: "100%",
              height: "40px",
              padding: "0 36px 0 38px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--color-admin-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-text)",
              fontSize: "var(--font-size-sm)",
              outline: "none",
              transition: "border-color var(--transition-fast)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-admin-accent)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-admin-border)";
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              aria-label={t("clearSearch", { defaultValue: "Suche löschen" })}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-admin-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-sm)",
          }}
        >
          {/* Role Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="filter-role-select"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-muted)",
                fontWeight: 500,
              }}
            >
              {t("role", { defaultValue: "Rolle" })}:
            </label>
            <select
              id="filter-role-select"
              value={filters.role}
              onChange={(e) => onChange({ role: e.target.value })}
              style={{
                height: "40px",
                padding: "0 var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-admin-text)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">{t("filterAllRoles", { defaultValue: "Alle Rollen" })}</option>
              <option value="CUSTOMER">Kunde (CUSTOMER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
              <option value="SUPER_ADMIN">Super-Administrator (SUPER_ADMIN)</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="filter-verified-select"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-muted)",
                fontWeight: 500,
              }}
            >
              {t("status", { defaultValue: "Status" })}:
            </label>
            <select
              id="filter-verified-select"
              value={filters.is_verified}
              onChange={(e) => onChange({ is_verified: e.target.value })}
              style={{
                height: "40px",
                padding: "0 var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-admin-text)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">{t("filterAllStatuses", { defaultValue: "Alle Status" })}</option>
              <option value="true">{t("verifiedOnly", { defaultValue: "Nur Verifizierte" })}</option>
              <option value="false">{t("unverifiedOnly", { defaultValue: "Nicht Verifizierte" })}</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              style={{
                color: "var(--color-admin-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="close" size={14} />
              <span>{t("resetFilters", { defaultValue: "Zurücksetzen" })}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Results Count Line */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-admin-muted)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "var(--space-xs)",
        }}
      >
        <span>
          {loading
            ? t("loadingUsers", { defaultValue: "Benutzerliste wird geladen..." })
            : t("usersFoundCount", {
                count: totalResults,
                defaultValue: "{{count}} Benutzer gefunden",
              })}
        </span>
      </div>
    </div>
  );
}

export default UserFiltersBar;
