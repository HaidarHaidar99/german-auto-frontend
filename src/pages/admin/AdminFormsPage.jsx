import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import formsService from "../../services/forms/forms.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import FormSummaryCards from "../../components/admin/forms/FormSummaryCards";
import FormFiltersBar from "../../components/admin/forms/FormFiltersBar";
import FormTable from "../../components/admin/forms/FormTable";
import FormDetailDrawer from "../../components/admin/forms/FormDetailDrawer";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminFormsPage() {
  const { t } = useTranslation(["admin", "forms", "common"]);
  const pageContainerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters: search query, form_type, status, sort
  const [filters, setFilters] = useState({
    search: "",
    form_type: "ALL",
    status: "ALL",
    sort: "newest",
  });

  // Selected form for detail drawer
  const [selectedForm, setSelectedForm] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status update tracking
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (type, text) => {
    setToastNotification({ type, text });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  // Page title
  useEffect(() => {
    document.title = `${t("forms", { defaultValue: "Formulareingänge" })} | ADMINCORE`;
  }, [t]);

  // ─── Fetch Forms ────────────────────────────────────────────────────────────
  const fetchForms = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await formsService.adminGetForms({
        limit: 100,
        sort: "newest",
      });
      const items = res?.data?.forms || [];
      setForms(items);
      setError(null);

      // Concurrently enrich items with full details via GET /api/forms/admin/:id
      if (items.length > 0) {
        const details = await Promise.allSettled(
          items.map((item) => formsService.adminGetForm(item.id))
        );
        setForms((prev) =>
          prev.map((item) => {
            const found = details.find(
              (d) => d.status === "fulfilled" && d.value?.data?.id === item.id
            );
            if (found && found.value?.data) {
              return { ...item, ...found.value.data };
            }
            return item;
          })
        );
      }
    } catch (err) {
      setError(err?.message || "Fehler beim Laden der Formulareingänge.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Animation on load
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-forms-animated-content", {
      opacity: 0,
      y: 18,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  // Open detail drawer and optionally refresh single form
  const handleOpenDetail = useCallback(async (formItem) => {
    setSelectedForm(formItem);
    setIsDrawerOpen(true);

    // Fetch fresh single record to ensure full payload
    try {
      const freshRes = await formsService.adminGetForm(formItem.id);
      if (freshRes?.data) {
        setSelectedForm(freshRes.data);
      }
    } catch {
      // If single fetch fails, continue displaying the list row data
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedForm(null);
  }, []);

  // Update status (e.g. from table or drawer)
  const handleUpdateStatus = useCallback(
    async (formId, newStatus) => {
      if (!formId || !newStatus) return;
      try {
        setUpdatingStatusId(formId);
        const res = await formsService.adminUpdateForm(formId, { status: newStatus });
        const updated = res?.data || { status: newStatus, updated_at: new Date().toISOString() };

        // Update forms list immutably
        setForms((prev) =>
          prev.map((item) =>
            item.id === formId ? { ...item, ...updated, status: newStatus } : item
          )
        );

        // Update active drawer form if open
        setSelectedForm((prev) =>
          prev && prev.id === formId ? { ...prev, ...updated, status: newStatus } : prev
        );

        showToast("success", t("formUpdated", { defaultValue: "Eingang erfolgreich aktualisiert." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Aktualisieren des Status.");
        throw err;
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [t]
  );

  // Update admin notes
  const handleUpdateNotes = useCallback(
    async (formId, notes) => {
      if (!formId) return;
      try {
        const res = await formsService.adminUpdateForm(formId, { admin_notes: notes });
        const updated = res?.data || { admin_notes: notes, updated_at: new Date().toISOString() };

        setForms((prev) =>
          prev.map((item) =>
            item.id === formId ? { ...item, ...updated, admin_notes: notes } : item
          )
        );

        setSelectedForm((prev) =>
          prev && prev.id === formId ? { ...prev, ...updated, admin_notes: notes } : prev
        );

        showToast("success", t("notesSaved", { defaultValue: "Notizen erfolgreich gespeichert." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Speichern der Notiz.");
        throw err;
      }
    },
    [t]
  );

  // Archive submission
  const handleArchive = useCallback(
    async (formItem) => {
      if (!formItem) return;
      const confirmed = window.confirm(
        t("archiveConfirmMessage", {
          defaultValue:
            "Möchten Sie diesen Formulareingang wirklich archivieren? Der Status wird auf ARCHIVIERT gesetzt.",
        })
      );
      if (!confirmed) return;

      try {
        await handleUpdateStatus(formItem.id, "ARCHIVED");
        showToast("success", t("formArchived", { defaultValue: "Eingang erfolgreich archiviert." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Archivieren.");
      }
    },
    [handleUpdateStatus, t]
  );

  // ─── Filter & Search Logic ──────────────────────────────────────────────────
  const filteredForms = useMemo(() => {
    let result = [...forms];

    // Filter by Form Type
    if (filters.form_type && filters.form_type !== "ALL") {
      result = result.filter((item) => item.form_type === filters.form_type);
    }

    // Filter by Status
    if (filters.status && filters.status !== "ALL") {
      result = result.filter((item) => item.status === filters.status);
    }

    // Filter by Search Query
    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((item) => {
        const data = item.data || {};
        const isContact = item.form_type === "CONTACT";

        // Names
        const nameMatch = isContact
          ? (data.name || "").toLowerCase().includes(q)
          : `${data.first_name || ""} ${data.last_name || ""}`.toLowerCase().includes(q);

        // Contact info
        const emailMatch = (data.email || "").toLowerCase().includes(q);
        const phoneMatch = (data.phone || "").toLowerCase().includes(q);

        // Subject / Message
        const regardingMatch = (data.regarding || "").toLowerCase().includes(q);
        const messageMatch = (data.message || "").toLowerCase().includes(q);

        // Vehicle info (for Sell Your Car)
        const brandMatch = (data.brand || "").toLowerCase().includes(q);
        const modelMatch = (data.model || "").toLowerCase().includes(q);
        const vinMatch = (data.vin || "").toLowerCase().includes(q);
        const postalMatch = (data.postal_code || "").toLowerCase().includes(q);

        return (
          nameMatch ||
          emailMatch ||
          phoneMatch ||
          regardingMatch ||
          messageMatch ||
          brandMatch ||
          modelMatch ||
          vinMatch ||
          postalMatch
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime() || 0;
      const dateB = new Date(b.created_at).getTime() || 0;
      return filters.sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [forms, filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      form_type: "ALL",
      status: "ALL",
      sort: "newest",
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.form_type !== "ALL" ||
    filters.status !== "ALL" ||
    filters.sort !== "newest"
  );

  return (
    <div ref={pageContainerRef} className="admin-forms-page" style={{ position: "relative" }}>
      {/* Toast Feedback */}
      {toastNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 18px",
            borderRadius: "var(--radius-md, 8px)",
            backgroundColor:
              toastNotification.type === "success"
                ? "rgba(34, 197, 94, 0.95)"
                : "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
            fontSize: "var(--font-size-sm, 14px)",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon
            name={toastNotification.type === "success" ? "check-circle" : "alert-circle"}
            size={18}
          />
          <span>{toastNotification.text}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title={t("forms", { defaultValue: "Formulareingänge" })}
        subtitle={t("formsSubtitle", {
          defaultValue: "Verwaltung aller Kontaktanfragen und Fahrzeugankauf-Einsendungen",
        })}
        badge={
          <Badge variant="secondary" size="sm">
            {forms.length} {t("statTotalForms", { defaultValue: "Eingänge" })}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchForms(true)}
            disabled={loading || refreshing}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Icon
              name="refresh-cw"
              size={14}
              style={{
                animation: refreshing ? "btn-spin 0.8s linear infinite" : "none",
              }}
            />
            <span>{t("refresh", { defaultValue: "Aktualisieren" })}</span>
          </Button>
        }
      />

      <div
        className="admin-forms-animated-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg, 24px)",
        }}
      >
        {/* Real Summary Counts Cards */}
        <FormSummaryCards
          forms={forms}
          activeStatusFilter={filters.status}
          activeTypeFilter={filters.form_type === "ALL" ? "" : filters.form_type}
          onSelectStatusFilter={(statusVal) =>
            setFilters((prev) => ({ ...prev, status: statusVal }))
          }
          onSelectTypeFilter={(typeVal) =>
            setFilters((prev) => ({ ...prev, form_type: typeVal || "ALL" }))
          }
        />

        {/* Filter & Search Bar */}
        <FormFiltersBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
        />

        {/* Data View States */}
        {loading ? (
          <AdminLoadingState message="Lade Formulareingänge aus der Datenbank..." />
        ) : error ? (
          <ErrorState
            title="Fehler beim Laden"
            message={error}
            onRetry={() => fetchForms(false)}
          />
        ) : forms.length === 0 ? (
          <AdminEmptyState
            icon="mail"
            title={t("noFormsTitle", { defaultValue: "Keine Formulareingänge vorhanden" })}
            message={t("noFormsDesc", {
              defaultValue:
                "Es sind derzeit keine Anfragen oder Fahrzeugbewertungen in der Datenbank gespeichert.",
            })}
            actionLabel={t("refresh", { defaultValue: "Aktualisieren" })}
            onAction={() => fetchForms(true)}
          />
        ) : filteredForms.length === 0 ? (
          <AdminEmptyState
            icon="search"
            title={t("noMatchingFormsTitle", { defaultValue: "Keine passenden Eingänge gefunden" })}
            message={t("noMatchingFormsDesc", {
              defaultValue: "Zu den gewählten Filterkriterien liegen keine Formulareingänge vor.",
            })}
            actionLabel={hasActiveFilters ? t("resetFilters", { defaultValue: "Filter zurücksetzen" }) : undefined}
            onAction={handleResetFilters}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm, 12px)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 4px",
                fontSize: "12px",
                color: "var(--color-admin-muted, #94a3b8)",
              }}
            >
              <span>
                {filteredForms.length} von {forms.length} Eingängen angezeigt
              </span>
            </div>

            <FormTable
              forms={filteredForms}
              onViewDetail={handleOpenDetail}
              onChangeStatus={handleUpdateStatus}
              onArchive={handleArchive}
              updatingStatusId={updatingStatusId}
            />
          </div>
        )}
      </div>

      {/* Detail Slide-Over Drawer */}
      <FormDetailDrawer
        isOpen={isDrawerOpen}
        form={selectedForm}
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
        onArchive={handleArchive}
      />
    </div>
  );
}

export default AdminFormsPage;
