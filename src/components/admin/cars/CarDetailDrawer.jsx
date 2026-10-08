import React from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

export function CarDetailDrawer({
  isOpen,
  car,
  onClose,
  onEdit,
}) {
  const { t, i18n } = useTranslation(["admin", "cars", "common"]);
  const currentLang = i18n?.language?.startsWith("en") ? "en" : "de";

  if (!car) return null;

  const vehicleName = car.title || `${car.brand || ""} ${car.model || ""}`.trim() || t("colCar", { defaultValue: "Vehicle" });
  const formattedPrice = car.price != null
    ? new Intl.NumberFormat(currentLang === "en" ? "en-US" : "de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(car.price)
    : t("priceOnRequest", { defaultValue: "Price on request" });

  const formattedMileage = car.mileage_km != null
    ? `${new Intl.NumberFormat(currentLang === "en" ? "en-US" : "de-DE").format(car.mileage_km)} km`
    : null;

  const media = car.media || {};
  const gallery = Array.isArray(media.gallery) ? media.gallery : [];
  const equipment = Array.isArray(car.equipment) ? car.equipment : [];
  const customFields = typeof car.custom_fields === "object" && car.custom_fields !== null ? car.custom_fields : {};

  const handleOpenPublicView = () => {
    const slugOrId = car.slug || car.id;
    const fullUrl = `${window.location.origin}/cars/${slugOrId}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleName}
      size="lg"
      position="right"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", paddingBottom: "var(--space-xl)" }}>
        {/* Top Header Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Badge
              variant={car.status === "AVAILABLE" ? "success" : car.status === "RESERVED" ? "warning" : "default"}
              size="sm"
            >
              {car.status}
            </Badge>
            {car.is_featured && (
              <Badge variant="secondary" size="sm">
                Featured
              </Badge>
            )}
            {!car.is_visible && (
              <Badge variant="outline" size="sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                {t("statHidden", { defaultValue: "Hidden" })}
              </Badge>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Button variant="outline" size="sm" onClick={handleOpenPublicView}>
              <Icon name="external-link" size={14} style={{ marginRight: "6px" }} />
              {t("previewPublicVehicle", { defaultValue: "Public View" })}
            </Button>
            <Button variant="primary" size="sm" onClick={() => onEdit?.(car)}>
              <Icon name="edit" size={14} style={{ marginRight: "6px" }} />
              {t("edit", { defaultValue: "Edit" })}
            </Button>
          </div>
        </div>

        {/* Thumbnail Hero Preview */}
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "240px",
              borderRadius: "var(--radius-md, 8px)",
              overflow: "hidden",
              backgroundColor: "#000",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.1))",
            }}
          >
            <img
              src={media.thumbnail}
              alt={vehicleName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Price & Core Metric Box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "var(--space-sm)",
            padding: "var(--space-md)",
            backgroundColor: "var(--color-admin-accent-subtle, rgba(2, 132, 199, 0.05))",
            borderRadius: "var(--radius-sm, 6px)",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("price", { defaultValue: "Price" })}</span>
            <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-secondary, #D4AF37)" }}>{formattedPrice}</strong>
          </div>
          {formattedMileage && (
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("mileage", { defaultValue: "Mileage" })}</span>
              <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>{formattedMileage}</strong>
            </div>
          )}
          {car.performance_hp && (
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("powerHp", { defaultValue: "Power" })}</span>
              <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>{car.performance_hp} HP</strong>
            </div>
          )}
          {car.fuel_type && (
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("fuelType", { defaultValue: "Fuel" })}</span>
              <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>{car.fuel_type}</strong>
            </div>
          )}
          {car.transmission && (
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("transmission", { defaultValue: "Transmission" })}</span>
              <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>{car.transmission}</strong>
            </div>
          )}
          {car.first_registration && (
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", display: "block" }}>{t("firstRegistration", { defaultValue: "First Registration" })}</span>
              <strong style={{ fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>{car.first_registration}</strong>
            </div>
          )}
        </div>

        {/* Descriptions */}
        {(car.description_de || car.description_en) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {car.description_de && (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-admin-muted)", textTransform: "uppercase" }}>
                  {t("descriptionDe", { defaultValue: "Description (DE)" })}
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #0f172a)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {car.description_de}
                </p>
              </div>
            )}
            {car.description_en && (
              <div style={{ marginTop: "var(--space-sm)" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-admin-muted)", textTransform: "uppercase" }}>
                  {t("descriptionEn", { defaultValue: "Description (EN)" })}
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #0f172a)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {car.description_en}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Equipment Badges */}
        {equipment.length > 0 && (
          <div>
            <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #0f172a)" }}>
              {t("equipmentTab", { defaultValue: "Equipment" })} ({equipment.length})
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {equipment.map((item, idx) => (
                <Badge key={idx} variant="outline" size="sm">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {Object.keys(customFields).length > 0 && (
          <div>
            <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #0f172a)" }}>
              {t("customFields", { defaultValue: "Custom Fields" })}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                padding: "var(--space-sm)",
                backgroundColor: "var(--color-admin-accent-subtle, rgba(2, 132, 199, 0.05))",
                borderRadius: "var(--radius-sm, 6px)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
              }}
            >
              {Object.entries(customFields).map(([k, v]) => (
                <div key={k} style={{ fontSize: "var(--font-size-xs)" }}>
                  <span style={{ color: "var(--color-admin-muted)" }}>{k}:</span>{" "}
                  <span style={{ color: "var(--color-admin-text, #0f172a)" }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Thumbnails */}
        {gallery.length > 0 && (
          <div>
            <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #0f172a)" }}>
              {t("galleryImages", { defaultValue: "Gallery Photos" })} ({gallery.length})
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "var(--space-xs)" }}>
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    height: "60px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    backgroundColor: "#000",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default CarDetailDrawer;
