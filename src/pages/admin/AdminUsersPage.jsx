import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import adminUsersService from "../../services/adminUsers/adminUsers.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import UserSummaryCards from "../../components/admin/users/UserSummaryCards";
import UserFiltersBar from "../../components/admin/users/UserFiltersBar";
import UserTable from "../../components/admin/users/UserTable";
import UserDetailDrawer from "../../components/admin/users/UserDetailDrawer";
import CreateAdminModal from "../../components/admin/users/CreateAdminModal";
import ChangeRoleModal from "../../components/admin/users/ChangeRoleModal";
import RevokeSessionsModal from "../../components/admin/users/RevokeSessionsModal";
import DeleteUserModal from "../../components/admin/users/DeleteUserModal";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import UnauthorizedState from "../../components/ui/UnauthorizedState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user: currentUser, isSuperAdmin } = useAuth();
  const pageContainerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Pagination meta from backend
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  });

  // Global counts for summary cards
  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    admins: 0,
    superAdmins: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    role: "ALL",
    is_verified: "ALL",
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Modals / Drawers state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [revokeModalUser, setRevokeModalUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  // Toast feedback state
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (type, text) => {
    setToastNotification({ type, text });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  useEffect(() => {
    document.title = `${t("userManagement", { defaultValue: "Benutzerverwaltung" })} | ADMINCORE`;
  }, [t]);

  // ─── Fetch Stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      setStatsLoading(true);
      const [totalRes, custRes, admRes, superRes] = await Promise.allSettled([
        adminUsersService.getUsers({ limit: 1 }),
        adminUsersService.getUsers({ role: "CUSTOMER", limit: 1 }),
        adminUsersService.getUsers({ role: "ADMIN", limit: 1 }),
        adminUsersService.getUsers({ role: "SUPER_ADMIN", limit: 1 }),
      ]);

      setStats({
        total: totalRes.status === "fulfilled" ? totalRes.value?.meta?.total || 0 : 0,
        customers: custRes.status === "fulfilled" ? custRes.value?.meta?.total || 0 : 0,
        admins: admRes.status === "fulfilled" ? admRes.value?.meta?.total || 0 : 0,
        superAdmins: superRes.status === "fulfilled" ? superRes.value?.meta?.total || 0 : 0,
      });
    } catch {
      // Fallback silently if stats fail
    } finally {
      setStatsLoading(false);
    }
  }, [isSuperAdmin]);

  // ─── Fetch Users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (page = 1, currentFilters = null, isRefresh = false) => {
      if (!isSuperAdmin) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const activeFilters = currentFilters || filtersRef.current;

      try {
        const queryParams = {
          page,
          limit: PAGE_SIZE,
        };

        if (activeFilters.search && activeFilters.search.trim()) {
          queryParams.search = activeFilters.search.trim();
        }
        if (activeFilters.role && activeFilters.role !== "ALL") {
          queryParams.role = activeFilters.role;
        }
        if (activeFilters.is_verified && activeFilters.is_verified !== "ALL") {
          queryParams.is_verified = activeFilters.is_verified;
        }

        const res = await adminUsersService.getUsers(queryParams);
        const fetchedUsers = res?.data?.users || [];
        const meta = res?.meta || {
          total: fetchedUsers.length,
          page,
          limit: PAGE_SIZE,
          pages: Math.max(1, Math.ceil(fetchedUsers.length / PAGE_SIZE)),
        };

        setUsers(fetchedUsers);
        setPagination({
          page: meta.page || page,
          limit: meta.limit || PAGE_SIZE,
          total: meta.total ?? fetchedUsers.length,
          pages: meta.pages || 1,
        });
        setError(null);
      } catch (err) {
        setError(
          err?.message ||
          t("errorLoadUsersFailed", { defaultValue: "Fehler beim Laden der Benutzerkonten." })
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isSuperAdmin, t]
  );

  // Search debounce ref
  const searchTimeoutRef = useRef(null);

  const handleFilterChange = (newFilterDelta) => {
    const nextFilters = { ...filters, ...newFilterDelta };
    setFilters(nextFilters);

    if ("search" in newFilterDelta) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers(1, nextFilters);
      }, 350);
    } else {
      fetchUsers(1, nextFilters);
    }
  };

  const handleResetFilters = () => {
    const reset = { search: "", role: "ALL", is_verified: "ALL" };
    setFilters(reset);
    fetchUsers(1, reset);
  };

  // Initial load
  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers(1);
      fetchStats();
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchUsers, fetchStats, isSuperAdmin]);

  // Subtle GSAP entrance animation
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-users-animated-content", {
      opacity: 0,
      y: 16,
      duration: 0.45,
      ease: "power2.out",
    });
  });

  // ─── Modal Actions Handlers ─────────────────────────────────────────────────

  const handleCreateSuccess = (newUser) => {
    setCreateModalOpen(false);
    showToast(
      "success",
      t("adminCreatedSuccess", {
        name: newUser?.full_name || newUser?.email,
        defaultValue: `Administrator-Konto für "${newUser?.full_name || newUser?.email}" erfolgreich angelegt.`,
      })
    );
    fetchUsers(1, filters);
    fetchStats();
  };

  const handleRoleChangeSuccess = (updatedUser) => {
    setRoleModalUser(null);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u))
    );
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser((prev) => ({ ...prev, role: updatedUser.role }));
    }
    showToast(
      "success",
      t("roleUpdatedSuccess", {
        name: updatedUser.full_name || updatedUser.email,
        role: updatedUser.role,
        defaultValue: `Rolle von "${updatedUser.full_name || updatedUser.email}" wurde auf "${updatedUser.role}" aktualisiert.`,
      })
    );
    fetchStats();
  };

  const handleRevokeSessionsSuccess = (targetUser) => {
    setRevokeModalUser(null);
    showToast(
      "success",
      t("sessionsRevokedSuccess", {
        name: targetUser.full_name || targetUser.email,
        defaultValue: `Alle aktiven Sitzungen für "${targetUser.full_name || targetUser.email}" wurden beendet.`,
      })
    );
  };

  const handleDeleteSuccess = (deletedUserId) => {
    setDeleteModalUser(null);
    if (selectedUser?.id === deletedUserId) {
      setSelectedUser(null);
      setIsDrawerOpen(false);
    }
    showToast(
      "success",
      t("userDeletedSuccess", { defaultValue: "Benutzerkonto wurde dauerhaft gelöscht." })
    );

    // If current page is left empty after deletion, step back
    const remainingOnPage = users.filter((u) => u.id !== deletedUserId).length;
    const targetPage = remainingOnPage === 0 && pagination.page > 1 ? pagination.page - 1 : pagination.page;

    fetchUsers(targetPage, filters);
    fetchStats();
  };

  // ─── Security Guard: Only SUPER_ADMIN ───────────────────────────────────────
  if (!isSuperAdmin) {
    return (
      <UnauthorizedState
        message={t("superAdminOnlyNotice", {
          defaultValue: "Zugriff verweigert. Dieser Bereich erfordert Super-Administrator-Rechte.",
        })}
      />
    );
  }

  return (
    <div ref={pageContainerRef} className="admin-users-page" style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toastNotification && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "var(--space-xl)",
            right: "var(--space-xl)",
            zIndex: 1000,
            padding: "14px 20px",
            borderRadius: "var(--radius-lg)",
            backgroundColor:
              toastNotification.type === "error"
                ? "rgba(220, 38, 38, 0.95)"
                : "rgba(22, 101, 52, 0.95)",
            color: "#ffffff",
            boxShadow: "var(--shadow-elevation-3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon name={toastNotification.type === "error" ? "alert-circle" : "check"} size={18} />
          <span>{toastNotification.text}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title={t("userManagement", { defaultValue: "Benutzerverwaltung & Sicherheit" })}
        subtitle={t("userManagementSubtitle", {
          defaultValue:
            "Verwalten Sie Kunden- und Administratorenkonten, Rollenberechtigungen und Sitzungssicherheit.",
        })}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Icon name="user-plus" size={16} />
            <span>{t("addAdministrator", { defaultValue: "Administrator anlegen" })}</span>
          </Button>
        }
      />

      {/* Main Content Area */}
      <div className="admin-users-animated-content">
        {/* Real Summary Metrics */}
        <UserSummaryCards stats={stats} loading={statsLoading} />

        {/* Filters and Search Bar */}
        <UserFiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={pagination.total}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <ErrorState
            title={t("errorLoadingUsers", { defaultValue: "Fehler beim Laden" })}
            message={error}
            onRetry={() => {
              fetchUsers(pagination.page, filters);
              fetchStats();
            }}
          />
        )}

        {/* Loading State or Users Table */}
        {loading && !refreshing ? (
          <AdminLoadingState message={t("loadingUserAccounts", { defaultValue: "Benutzerdaten werden geladen..." })} />
        ) : (
          <UserTable
            users={users}
            currentUserId={currentUser?.id}
            pagination={pagination}
            loading={loading || refreshing}
            onPageChange={(newPage) => fetchUsers(newPage, filters)}
            onViewDetails={(u) => {
              setSelectedUser(u);
              setIsDrawerOpen(true);
            }}
            onChangeRole={(u) => setRoleModalUser(u)}
            onRevokeSessions={(u) => setRevokeModalUser(u)}
            onDeleteUser={(u) => setDeleteModalUser(u)}
          />
        )}
      </div>

      {/* ─── MODALS & DRAWERS ───────────────────────────────────────────────── */}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={selectedUser}
        currentUserId={currentUser?.id}
        onChangeRole={(u) => setRoleModalUser(u)}
        onRevokeSessions={(u) => setRevokeModalUser(u)}
        onDeleteUser={(u) => setDeleteModalUser(u)}
      />

      {/* Create Administrator Modal */}
      <CreateAdminModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        user={roleModalUser}
        currentUserId={currentUser?.id}
        onSuccess={handleRoleChangeSuccess}
      />

      {/* Revoke Sessions Modal */}
      <RevokeSessionsModal
        isOpen={Boolean(revokeModalUser)}
        onClose={() => setRevokeModalUser(null)}
        user={revokeModalUser}
        currentUserId={currentUser?.id}
        onSuccess={handleRevokeSessionsSuccess}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={Boolean(deleteModalUser)}
        onClose={() => setDeleteModalUser(null)}
        user={deleteModalUser}
        currentUserId={currentUser?.id}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default AdminUsersPage;
