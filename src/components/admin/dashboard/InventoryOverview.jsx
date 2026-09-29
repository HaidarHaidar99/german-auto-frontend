import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

export function InventoryOverview({ inventory, loading = false }) {
  const { t } = useTranslation(["admin", "common"]);

  const total = inventory?.total || 0;
  const available = inventory?.available || 0;
  const sold = inventory?.sold || 0;
  const reserved = inventory?.reserved || 0;
  const hidden = inventory?.hidden || 0;
  const featured = inventory?.featured || 0;

  const pct = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

  const statusItems = [
    {
      label: t("statusAvailable", { defaultValue: "Verfügbar" }),
      count: available,
      percentage: pct(available),
      color: "var(--color-success, #22c55e)",
      bg: "rgba(34, 197, 94, 0.15)",
      badgeVariant: "success",
      query: "status=AVAILABLE",
    },
    {
      label: t("statusSold", { defaultValue: "Verkauft" }),
      count: sold,
      percentage: pct(sold),
      color: "var(--color-admin-muted, #94a3b8)",
      bg: "rgba(148, 163, 184, 0.15)",
      badgeVariant: "neutral",
      query: "status=SOLD",
    },
    {
      label: t("statusReserved", { defaultValue: "Reserviert" }),
      count: reserved,
      percentage: pct(reserved),
      color: "var(--color-admin-accent, var(--color-admin-text))",
      bg: "rgba(255, 255, 255, 0.15)",
      badgeVariant: "secondary",
      query: "status=RESERVED",
    },
    {
      label: t("statusHidden", { defaultValue: "Ausgeblendet" }),
      count: hidden,
      percentage: pct(hidden),
      color: "var(--color-warning, #f59e0b)",
      bg: "rgba(245, 158, 11, 0.15)",
      badgeVariant: "warning",
      query: "status=HIDDEN",
    },
  ];

  return (
    <AdminSectionCard
      title={t("inventoryOverview", { defaultValue: "Bestandsübersicht & Statusverteilung" })}
      subtitle={t("inventorySubtitle", {
        defaultValue: "{{total}} Fahrzeuge im Gesamtsystem registriert (davon {{featured}} besonders hervorgehoben)",
        total,
        featured,
      })}
      actions={
        <Button
          as={Link}
          to="/admincoresecure/cars"
          variant="ghost"
          size="sm"
          iconRight="arrow-right"
        >
          {t("manageVehicles", { defaultValue: "Fahrzeuge verwalten" })}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Visual Distribution Ratio Bar */}
        {total > 0 ? (
          <div>
            <div
              style={{
                height: "12px",
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "var(--radius-full)",
                display: "flex",
                overflow: "hidden",
                gap: "2px",
              }}
            >
              {statusItems.map(
                (item) =>
                  item.count > 0 && (
                    <div
                      key={item.label}
                      title={`${item.label}: ${item.count} (${item.percentage}%)`}
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                        transition: "width 0.5s ease",
                      }}
                    />
                  )
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-admin-muted)",
            }}
          >
            {t("noInventoryRegistered", { defaultValue: "Noch keine Fahrzeuge im System angelegt." })}
          </div>
        )}

        {/* Detailed Status Breakdown Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {statusItems.map((item) => (
            <Link
              key={item.label}
              to={`/admincoresecure/cars?${item.query}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--color-admin-border)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>{item.label}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "var(--font-size-base)", fontWeight: 800, color: "var(--color-admin-text)" }}>
                  {item.count}
                </span>
                <Badge variant={item.badgeVariant} size="sm">
                  {item.percentage}%
                </Badge>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured inventory callout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <Icon name="star" size={14} style={{ color: "var(--color-admin-accent)" }} />
            <span style={{ color: "var(--color-admin-text)", fontWeight: 500 }}>
              {t("featuredShowcaseNotice", {
                defaultValue: "{{count}} Fahrzeuge sind aktuell als Highlight-Fahrzeuge markiert.",
                count: featured,
              })}
            </span>
          </div>

          <Link
            to="/admincoresecure/cars?featured=true"
            style={{
              color: "var(--color-admin-accent)",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "var(--font-size-xs)",
            }}
          >
            {t("filterFeatured", { defaultValue: "Highlights filtern" })} →
          </Link>
        </div>
      </div>
    </AdminSectionCard>
  );
}

export default InventoryOverview;
