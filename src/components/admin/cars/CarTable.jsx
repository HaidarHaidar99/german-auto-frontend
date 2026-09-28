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
  const { t } = useTranslation(["admin", "cars", "common"]);

  const formatPrice = (price) => {
    if (price == null) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (km) => {
    if (km == null) return "—";
    return `${new Intl.NumberFormat("de-DE").format(km)} km`;
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
            fontSize: "var(--font-size-xs)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                color: "var(--color-admin-muted, var(--color-text-muted))",
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 16px", width: "70px" }}>Vorschau</th>
              <th style={{ padding: "12px 16px" }}>Fahrzeug / Modell</th>
              <th style={{ padding: "12px 16px" }}>Preis</th>
              <th style={{ padding: "12px 16px" }}>Kilometer & Baujahr</th>
              <th style={{ padding: "12px 16px" }}>Antrieb / Zustand</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Featured</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Sichtbar</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const thumbnail = car.media?.thumbnail || (Array.isArray(car.media?.gallery) && car.media.gallery[0]);
              const vehicleName = car.title || `${car.brand || ""} ${car.model || ""}`.trim();

              return (
                <tr
                  key={car.id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
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
                        border: "1px solid rgba(255, 255, 255, 0.1)",
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
                        <Icon name="car" size={18} style={{ color: "var(--color-admin-muted)" }} />
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
                          color: "var(--color-admin-text, #ffffff)",
                          display: "block",
                        }}
                      >
                        {vehicleName}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                        {car.brand} • {car.model}
                      </span>
                    </button>
                  </td>

                  {/* Price */}
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-primary, #C5A059)" }}>
                      {formatPrice(car.price)}
                    </span>
                    {car.old_price && (
                      <span style={{ fontSize: "10px", color: "var(--color-admin-muted)", textDecoration: "line-through", display: "block" }}>
                        {formatPrice(car.old_price)}
                      </span>
                    )}
                  </td>

                  {/* Mileage & Year */}
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ color: "var(--color-admin-text, #fff)" }}>{formatMileage(car.mileage_km)}</span>
                    <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>
                      {car.first_registration ? car.first_registration.substring(0, 4) : "—"}
                      {car.performance_hp ? ` • ${car.performance_hp} PS` : ""}
                    </span>
                  </td>

                  {/* Fuel / Transmission / Condition */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ color: "var(--color-admin-text, #fff)" }}>
                      {car.fuel_type || "—"} / {car.transmission || "—"}
                    </span>
                    {car.condition && (
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>
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
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: car.status === "AVAILABLE" ? "#22c55e" : car.status === "RESERVED" ? "#eab308" : "#94a3b8",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="AVAILABLE" style={{ backgroundColor: "#121418", color: "#22c55e" }}>AVAILABLE</option>
                      <option value="RESERVED" style={{ backgroundColor: "#121418", color: "#eab308" }}>RESERVED</option>
                      <option value="SOLD" style={{ backgroundColor: "#121418", color: "#94a3b8" }}>SOLD</option>
                      <option value="HIDDEN" style={{ backgroundColor: "#121418", color: "#ef4444" }}>HIDDEN</option>
                    </select>
                  </td>

                  {/* Featured Toggle */}
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <button
                      type="button"
                      title={car.is_featured ? "Hervorgehoben — Klicken zum Deaktivieren" : "Nicht hervorgehoben — Klicken zum Aktivieren"}
                      onClick={() => onToggleFeatured?.(car.id, !car.is_featured)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: car.is_featured ? "var(--color-primary, #C5A059)" : "rgba(255, 255, 255, 0.2)",
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
                      title={car.is_visible !== false ? "Sichtbar — Klicken zum Ausblenden" : "Ausgeblendet — Klicken zum Einblenden"}
                      onClick={() => onToggleVisibility?.(car.id, car.is_visible === false ? true : false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: car.is_visible !== false ? "#22c55e" : "#ef4444",
                        transition: "color 0.2s",
                      }}
                    >
                      <Icon name="eye" size={16} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <IconButton
                        name="external-link"
                        size="sm"
                        ariaLabel="Öffentliche Seite öffnen"
                        onClick={() => window.open(`/cars/${car.slug || car.id}`, "_blank", "noopener,noreferrer")}
                        style={{ width: "28px", height: "28px" }}
                      />
                      <IconButton
                        name="edit"
                        size="sm"
                        ariaLabel="Fahrzeug bearbeiten"
                        onClick={() => onEdit?.(car)}
                        style={{ width: "28px", height: "28px" }}
                      />
                      <IconButton
                        name="trash"
                        size="sm"
                        ariaLabel="Fahrzeug löschen"
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
                backgroundColor: "var(--color-admin-card, #121418)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
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
                        Versteckt
                      </Badge>
                    )}
                  </div>
                  <h4
                    onClick={() => onPreview?.(car)}
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      color: "var(--color-admin-text, #ffffff)",
                      cursor: "pointer",
                    }}
                  >
                    {vehicleName}
                  </h4>
                  <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                    {car.brand} • {car.model}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-xs)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-primary, #C5A059)" }}>
                    {formatPrice(car.price)}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginLeft: "8px" }}>
                    {formatMileage(car.mileage_km)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                  <IconButton
                    name="eye"
                    size="sm"
                    ariaLabel="Details"
                    onClick={() => onPreview?.(car)}
                  />
                  <IconButton
                    name="edit"
                    size="sm"
                    ariaLabel="Bearbeiten"
                    onClick={() => onEdit?.(car)}
                  />
                  <IconButton
                    name="trash"
                    size="sm"
                    ariaLabel="Löschen"
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
            backgroundColor: "var(--color-admin-card, #121418)",
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-admin-muted)",
          }}
        >
          <div>
            {t("paginationInfoVehicles", {
              page: pagination.page,
              pages: pagination.pages,
              total: pagination.total,
              defaultValue: `Seite ${pagination.page} von ${pagination.pages} (${pagination.total} Fahrzeuge gesamt)`,
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
              <span>{t("previous", { defaultValue: "Zurück" })}</span>
            </Button>

            <span
              style={{
                padding: "0 10px",
                fontWeight: 600,
                color: "var(--color-admin-text, #ffffff)",
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
              <span>{t("next", { defaultValue: "Weiter" })}</span>
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
