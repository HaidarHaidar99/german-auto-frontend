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
        borderRadius: "var(--radius-xl, 14px)",
        border: "1px solid var(--color-admin-border)",
        padding: "var(--space-md, 16px)",
        marginBottom: "var(--space-xl, 24px)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md, 14px)",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        className="admin-user-filters-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Search Input */}
        <div
          className="admin-user-search-wrapper"
          style={{
            position: "relative",
            flex: "1 1 240px",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
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
            placeholder={t("searchUsersPlaceholder", { defaultValue: "Search name or email..." })}
            aria-label={t("searchUsersPlaceholder", { defaultValue: "Search name or email..." })}
            style={{
              width: "100%",
              height: "38px",
              padding: "0 36px 0 38px",
              backgroundColor: "var(--color-admin-surface-muted, rgba(0, 0, 0, 0.02))",
              border: "1px solid var(--color-admin-border)",
              borderRadius: "var(--radius-md, 8px)",
              color: "var(--color-admin-text, #0f172a)",
              fontSize: "var(--font-size-xs, 12px)",
              outline: "none",
              boxSizing: "border-box",
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
              aria-label={t("clearSearch", { defaultValue: "Clear search" })}
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
          className="admin-user-filters-controls"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
            flex: "1 1 auto",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Role Filter */}
          <div
            className="admin-user-filter-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              minWidth: 0,
              flex: "1 1 140px",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor="filter-role-select"
              style={{
                fontSize: "var(--font-size-xs, 12px)",
                color: "var(--color-admin-muted)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {t("role", { defaultValue: "Role" })}:
            </label>
            <select
              id="filter-role-select"
              value={filters.role}
              onChange={(e) => onChange({ role: e.target.value })}
              style={{
                height: "38px",
                padding: "0 8px",
                backgroundColor: "var(--color-admin-surface-muted, rgba(0, 0, 0, 0.02))",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "var(--radius-md, 8px)",
                color: "var(--color-admin-text, #0f172a)",
                fontSize: "var(--font-size-xs, 12px)",
                outline: "none",
                cursor: "pointer",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <option value="ALL">{t("filterAllRoles", { defaultValue: "All Roles" })}</option>
              <option value="CUSTOMER">{t("roleCustomer", { defaultValue: "Customer" })}</option>
              <option value="ADMIN">{t("roleAdmin", { defaultValue: "Administrator" })}</option>
              <option value="SUPER_ADMIN">{t("roleSuperAdmin", { defaultValue: "Super Admin" })}</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div
            className="admin-user-filter-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              minWidth: 0,
              flex: "1 1 140px",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor="filter-verified-select"
              style={{
                fontSize: "var(--font-size-xs, 12px)",
                color: "var(--color-admin-muted)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {t("status", { defaultValue: "Status" })}:
            </label>
            <select
              id="filter-verified-select"
              value={filters.is_verified}
              onChange={(e) => onChange({ is_verified: e.target.value })}
              style={{
                height: "38px",
                padding: "0 8px",
                backgroundColor: "var(--color-admin-surface-muted, rgba(0, 0, 0, 0.02))",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "var(--radius-md, 8px)",
                color: "var(--color-admin-text, #0f172a)",
                fontSize: "var(--font-size-xs, 12px)",
                outline: "none",
                cursor: "pointer",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <option value="ALL">{t("filterAllStatuses", { defaultValue: "All Statuses" })}</option>
              <option value="true">{t("verifiedOnly", { defaultValue: "Verified Only" })}</option>
              <option value="false">{t("unverifiedOnly", { defaultValue: "Unverified Only" })}</option>
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
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                height: "38px",
                padding: "0 10px",
                fontSize: "11px",
                flexShrink: 0,
              }}
            >
              <Icon name="close" size={13} />
              <span>{t("resetFilters", { defaultValue: "Reset" })}</span>
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
          fontSize: "var(--font-size-xs, 11px)",
          color: "var(--color-admin-muted)",
          borderTop: "1px solid var(--color-admin-border)",
          paddingTop: "var(--space-xs, 6px)",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <span>
          {loading
            ? t("loadingUsers", { defaultValue: "Loading users list..." })
            : t("usersFoundCount", {
                count: totalResults,
                defaultValue: `${totalResults} users found`,
              })}
        </span>
      </div>
    </div>
  );
}

export default UserFiltersBar;
