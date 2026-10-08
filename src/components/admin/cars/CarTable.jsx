import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";

export function CarTable({
  cars = [],
  pagination = { page: 1, limit: 15, total: 0, pages: 1 },
  onPageChange,
  loading = false,
  onPreview,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleVisibility,
  onChangeStatus,
  className = "",
  style = {},
}) {
  const { t, i18n } = useTranslation(["admin", "cars", "common"]);
  const currentLang = i18n?.language?.startsWith("en") ? "en" : "de";

  const formatPrice = (price) => {
    if (price == null) return "—";
    return new Intl.NumberFormat(currentLang === "en" ? "en-US" : "de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (km) => {
    if (km == null) return "—";
    return `${new Intl.NumberFormat(currentLang === "en" ? "en-US" : "de-DE").format(km)} km`;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "RESERVED":
        return "warning";
      case "SOLD":
        return "default";
      case "HIDDEN":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className={`car-table-wrapper ${className}`.trim()} style={{ width: "100%", ...style }}>
      {/* Desktop Table View (>= 1024px) */}
      <div
        className="car-desktop-table-container"
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
            fontSize: "var(--font-size-xs)",
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
              <th style={{ padding: "12px 16px", width: "70px" }}>{t("columns.preview", { defaultValue: "Preview" })}</th>
              <th style={{ padding: "12px 16px" }}>{t("columns.vehicle", { defaultValue: "Vehicle / Name" })}</th>
              <th style={{ padding: "12px 16px" }}>{t("columns.price", { defaultValue: "Price" })}</th>
              <th style={{ padding: "12px 16px" }}>{t("columns.mileageYear", { defaultValue: "Mileage & Year" })}</th>
              <th style={{ padding: "12px 16px" }}>{t("columns.driveCondition", { defaultValue: "Fuel / Transmission" })}</th>
              <th style={{ padding: "12px 16px" }}>{t("columns.status", { defaultValue: "Status" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>{t("columns.featured", { defaultValue: "Featured" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>{t("columns.visible", { defaultValue: "Visible" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>{t("columns.actions", { defaultValue: "Actions" })}</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const thumbnail = car.media?.thumbnail || (Array.isArray(car.media?.gallery) && car.media.gallery[0]);
              const vehicleName = car.title || car.name || `${car.brand || ""} ${car.model || ""}`.trim();

              return (
                <tr
                  key={car.id}
                  style={{
                    borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-admin-accent-subtle, #f1f5f9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Thumbnail */}
                  <td style={{ padding: "10px 16px" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "40px",
                        borderRadius: "4px",
                        backgroundColor: "#000",
                        overflow: "hidden",
                        border: "1px solid var(--color-admin-border, #e2e8f0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={vehicleName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <Icon name="car" size={18} style={{ color: "var(--color-admin-muted, #64748b)" }} />
                      )}
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td style={{ padding: "10px 16px" }}>
                    <button
                      type="button"
                      onClick={() => onPreview?.(car)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        color: "inherit",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-admin-text, #0f172a)",
                          display: "block",
                        }}
                      >
                        {vehicleName}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                        {car.brand}
                      </span>
                    </button>
                  </td>

                  {/* Price */}
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-primary, #D4AF37)" }}>
                      {formatPrice(car.price)}
                    </span>
                    {car.old_price && (
                      <span style={{ fontSize: "10px", color: "var(--color-admin-muted, #64748b)", textDecoration: "line-through", display: "block" }}>
                        {formatPrice(car.old_price)}
                      </span>
                    )}
                  </td>

                  {/* Mileage & Year */}
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ color: "var(--color-admin-text, #0f172a)" }}>{formatMileage(car.mileage_km)}</span>
                    <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)", display: "block" }}>
                      {car.first_registration ? car.first_registration.substring(0, 4) : "—"}
                      {car.performance_hp ? ` • ${car.performance_hp} HP` : ""}
                    </span>
                  </td>

                  {/* Fuel / Transmission / Condition */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ color: "var(--color-admin-text, #0f172a)" }}>
                      {car.fuel_type || "—"} / {car.transmission || "—"}
                    </span>
                    {car.condition && (
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)", display: "block" }}>
                        {car.condition}
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td style={{ padding: "10px 16px" }}>
                    <select
                      value={car.status || "AVAILABLE"}
                      onChange={(e) => onChangeStatus?.(car.id, e.target.value)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "var(--radius-sm, 4px)",
                        border: "1px solid var(--color-admin-border, #e2e8f0)",
                        backgroundColor: "var(--color-admin-card, #ffffff)",
                        color: car.status === "AVAILABLE" ? "#16a34a" : car.status === "RESERVED" ? "#d97706" : "#64748b",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="AVAILABLE">{t("statusAvailable", { defaultValue: "AVAILABLE" })}</option>
                      <option value="RESERVED">{t("statusReserved", { defaultValue: "RESERVED" })}</option>
                      <option value="SOLD">{t("statusSold", { defaultValue: "SOLD" })}</option>
                      <option value="HIDDEN">{t("statusHidden", { defaultValue: "HIDDEN" })}</option>
                    </select>
                  </td>

                  {/* Featured Toggle */}
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <button
                      type="button"
                      title={car.is_featured ? t("featuredActivated", { defaultValue: "Featured" }) : t("featuredDeactivated", { defaultValue: "Not featured" })}
                      onClick={() => onToggleFeatured?.(car.id, !car.is_featured)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: car.is_featured ? "#f59e0b" : "var(--color-admin-muted, #cbd5e1)",
                        transition: "color 0.2s",
                      }}
                    >
                      <Icon name="star" size={16} />
                    </button>
                  </td>

                  {/* Visibility Toggle */}
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <button
                      type="button"
                      title={car.is_visible !== false ? t("visibilityVisible", { defaultValue: "Visible" }) : t("visibilityHidden", { defaultValue: "Hidden" })}
                      onClick={() => onToggleVisibility?.(car.id, car.is_visible === false ? true : false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: car.is_visible !== false ? "#16a34a" : "#dc2626",
                        transition: "color 0.2s",
                      }}
                    >
                      <Icon name={car.is_visible !== false ? "eye" : "eye-off"} size={16} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <IconButton
                        icon="eye"
                        size="sm"
                        ariaLabel={t("previewVehicle", { defaultValue: "View Vehicle Details" })}
                        title={t("previewVehicle", { defaultValue: "View Vehicle Details" })}
                        onClick={() => onPreview?.(car)}
                        style={{ width: "28px", height: "28px" }}
                      />
                      <IconButton
                        icon="external-link"
                        size="sm"
                        ariaLabel={t("openPublicPage", { defaultValue: "Open Public Page" })}
                        title={t("openPublicPage", { defaultValue: "Open Public Page" })}
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/cars/${car.slug || car.id}`;
                          window.open(fullUrl, "_blank", "noopener,noreferrer");
                        }}
                        style={{ width: "28px", height: "28px" }}
                      />
                      <IconButton
                        icon="edit"
                        size="sm"
                        ariaLabel={t("editVehicle", { defaultValue: "Edit Vehicle" })}
                        title={t("editVehicle", { defaultValue: "Edit Vehicle" })}
                        onClick={() => onEdit?.(car)}
                        style={{ width: "28px", height: "28px" }}
                      />
                      <IconButton
                        icon="trash"
                        size="sm"
                        ariaLabel={t("deleteVehicle", { defaultValue: "Delete Vehicle" })}
                        title={t("deleteVehicle", { defaultValue: "Delete Vehicle" })}
                        onClick={() => onDelete?.(car)}
                        style={{ width: "28px", height: "28px", color: "var(--color-error, #ef4444)" }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card List (< 1024px) */}
      <div className="car-mobile-card-list" style={{ display: "none", flexDirection: "column", gap: "var(--space-md)" }}>
        {cars.map((car) => {
          const thumbnail = car.media?.thumbnail || (Array.isArray(car.media?.gallery) && car.media.gallery[0]);
          const vehicleName = car.title || `${car.brand || ""} ${car.model || ""}`.trim();

          return (
            <div
              key={car.id}
              style={{
                backgroundColor: "var(--color-admin-card, #ffffff)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
                padding: "var(--space-md)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "flex-start" }}>
                {thumbnail && (
                  <div
                    style={{
                      width: "80px",
                      height: "60px",
                      borderRadius: "var(--radius-xs, 4px)",
                      backgroundColor: "#000",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={thumbnail}
                      alt={vehicleName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <Badge variant={getStatusBadgeVariant(car.status)} size="sm">
                      {car.status}
                    </Badge>
                    {car.is_featured && <Badge variant="secondary" size="sm">Featured</Badge>}
                    {car.is_visible === false && (
                      <Badge variant="outline" size="sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                        {t("statHidden", { defaultValue: "Hidden" })}
                      </Badge>
                    )}
                  </div>
                  <h4
                    onClick={() => onPreview?.(car)}
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      color: "var(--color-admin-text, #0f172a)",
                      cursor: "pointer",
                    }}
                  >
                    {vehicleName}
                  </h4>
                  <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                    {car.brand}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-xs)",
                  borderTop: "1px solid var(--color-admin-border, #e2e8f0)",
                }}
              >
                <div>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-primary, #D4AF37)" }}>
                    {formatPrice(car.price)}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)", marginLeft: "8px" }}>
                    {formatMileage(car.mileage_km)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                  <IconButton
                    icon="eye"
                    size="sm"
                    ariaLabel={t("previewVehicle", { defaultValue: "View Details" })}
                    onClick={() => onPreview?.(car)}
                  />
                  <IconButton
                    icon="edit"
                    size="sm"
                    ariaLabel={t("editVehicle", { defaultValue: "Edit" })}
                    onClick={() => onEdit?.(car)}
                  />
                  <IconButton
                    icon="trash"
                    size="sm"
                    ariaLabel={t("deleteVehicle", { defaultValue: "Delete" })}
                    onClick={() => onDelete?.(car)}
                    style={{ color: "var(--color-error, #ef4444)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SERVER-SIDE PAGINATION CONTROLS ─────────────────────────────────── */}
      {pagination && pagination.pages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            marginTop: "var(--space-md)",
            padding: "var(--space-md) var(--space-lg)",
            backgroundColor: "var(--color-admin-card, #ffffff)",
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-admin-muted, #64748b)",
          }}
        >
          <div>
            {t("paginationInfoVehicles", {
              page: pagination.page,
              pages: pagination.pages,
              total: pagination.total,
              defaultValue: `Page ${pagination.page} of ${pagination.pages} (${pagination.total} total vehicles)`,
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange?.(pagination.page - 1)}
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
              onClick={() => onPageChange?.(pagination.page + 1)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>{t("next", { defaultValue: "Next" })}</span>
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .car-desktop-table-container {
            display: none !important;
          }
          .car-mobile-card-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CarTable;
