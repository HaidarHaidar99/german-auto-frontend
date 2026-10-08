import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import AdminEmptyState from "../AdminEmptyState";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function RecentCars({ cars = [], loading = false }) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(currentLang === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success" size="sm">{t("statusAvailable", { defaultValue: "Available" })}</Badge>;
      case "SOLD":
        return <Badge variant="neutral" size="sm">{t("statusSold", { defaultValue: "Sold" })}</Badge>;
      case "RESERVED":
        return <Badge variant="secondary" size="sm">{t("statusReserved", { defaultValue: "Reserved" })}</Badge>;
      case "HIDDEN":
        return <Badge variant="warning" size="sm">{t("statusHidden", { defaultValue: "Hidden" })}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status || "—"}</Badge>;
    }
  };

  return (
    <AdminSectionCard
      title={t("recentVehicles", { defaultValue: "Recent Vehicles" })}
      subtitle={t("recentVehiclesSubtitle", { defaultValue: "Recently added vehicles" })}
      actions={
        <Button
          as={Link}
          to="/admincoresecure/cars"
          variant="ghost"
          size="sm"
          iconRight="arrow-right"
        >
          {t("viewAll", { defaultValue: "View All" })}
        </Button>
      }
    >
      {cars.length === 0 ? (
        <AdminEmptyState
          icon="car"
          title={t("noRecentVehicles", { defaultValue: "No vehicles registered in the system yet." })}
          actionLabel={t("manageVehicles", { defaultValue: "Add Vehicle" })}
          actionTo="/admincoresecure/cars"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          {cars.map((car) => {
            const img = car.media?.thumbnail || car.images?.[0] || car.image_url;
            return (
              <Link
                key={car.id}
                to={`/admincoresecure/cars?edit=${car.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--color-admin-border)",
                  gap: "var(--space-sm)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-admin-accent)";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-admin-border)";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", minWidth: 0 }}>
                  {img ? (
                    <img
                      src={img}
                      alt={`${car.brand} ${car.model || car.title}`}
                      style={{
                        width: "48px",
                        height: "36px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                        backgroundColor: "var(--color-surface)",
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-admin-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="car" size={18} />
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: 600,
                        color: "var(--color-admin-text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {car.brand} {car.model || car.title}
                    </div>
                    <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
                      {car.first_registration ? `${car.first_registration} • ` : ""}
                      {formatDate(car.created_at)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexShrink: 0 }}>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-accent)" }}>
                    {car.price ? `${car.price.toLocaleString("de-DE")} €` : "—"}
                  </span>
                  {getStatusBadge(car.status)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentCars;
