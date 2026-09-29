import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../forms/Input";
import Icon from "../common/Icon";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/auth/auth.service";
import adminUsersService from "../../services/adminUsers/adminUsers.service";

export function AdminProfileModal({ isOpen, onClose }) {
  const { user, role, refreshUser } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Tab State
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'role'

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Role Downgrade State
  const [otherSuperAdmins, setOtherSuperAdmins] = useState([]);
  const [checkingSuperAdmins, setCheckingSuperAdmins] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [roleSuccess, setRoleSuccess] = useState("");

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      checkOtherSuperAdmins();
    }
  }, [isOpen, isSuperAdmin]);

  const checkOtherSuperAdmins = async () => {
    try {
      setCheckingSuperAdmins(true);
      setRoleError("");
      const res = await adminUsersService.getUsers({ role: "SUPER_ADMIN", limit: 50 });
      const usersList = res?.data?.users || res?.data || [];
      const others = usersList.filter((u) => u.id !== user?.id);
      setOtherSuperAdmins(others);
    } catch {
      setOtherSuperAdmins([]);
    } finally {
      setCheckingSuperAdmins(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err?.message || "Failed to update password. Please check your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDowngradeSelf = async () => {
    if (otherSuperAdmins.length === 0) {
      setRoleError("You cannot downgrade your role. You are currently the only Super Admin. You must first assign another Super Admin.");
      return;
    }

    if (!window.confirm("Are you sure you want to downgrade your role to Administrator? You will forfeit Super Admin privileges.")) {
      return;
    }

    try {
      setRoleLoading(true);
      setRoleError("");
      await adminUsersService.updateRole(user.id, "ADMIN");
      setRoleSuccess("Your role has been downgraded to Administrator.");
      if (refreshUser) await refreshUser();
    } catch (err) {
      setRoleError(err?.message || "Failed to update role.");
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Profile & Settings"
      size="md"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-admin-border)",
            gap: "8px",
            paddingBottom: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "profile" ? "var(--color-admin-accent-subtle)" : "transparent",
              color: activeTab === "profile" ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Profile Info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "security" ? "var(--color-admin-accent-subtle)" : "transparent",
              color: activeTab === "security" ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Change Password
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("role")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "role" ? "var(--color-admin-accent-subtle)" : "transparent",
              color: activeTab === "role" ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Role Management
          </button>
        </div>

        {/* ─── TAB 1: Profile Info ────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-admin-stat-icon-bg-1)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                {(user?.full_name || user?.email || "A").charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "var(--color-admin-text)", fontWeight: 700 }}>
                  {user?.full_name || "Administrator"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-admin-muted)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-admin-border-subtle)",
                borderRadius: "12px",
                border: "1px solid var(--color-admin-border)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-admin-muted)", fontWeight: 600 }}>
                  Current System Role:
                </span>
                <span
                  style={{
                    backgroundColor: isSuperAdmin ? "#dcfce7" : "#e0f2fe",
                    color: isSuperAdmin ? "#16a34a" : "#0284c7",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-admin-muted)", fontWeight: 600 }}>
                  Account Status:
                </span>
                <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>
                  Active & Verified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Change Password ─────────────────────────────────── */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {passwordSuccess && (
              <div
                style={{
                  backgroundColor: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  color: "#16a34a",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Password successfully updated!
              </div>
            )}

            {passwordError && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {passwordError}
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="New Password (min. 8 characters)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
              <Button type="submit" variant="primary" loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        )}

        {/* ─── TAB 3: Role Management (Super Admin Downgrade Rule) ────── */}
        {activeTab === "role" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                backgroundColor: "var(--color-admin-border-subtle)",
                borderRadius: "12px",
                border: "1px solid var(--color-admin-border)",
                padding: "16px",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--color-admin-text)", fontWeight: 700 }}>
                Super Admin Role Policy
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--color-admin-muted)", lineHeight: 1.5 }}>
                A Super Administrator can only downgrade themselves to Administrator if at least one other active Super Administrator exists to maintain full system access.
              </p>
            </div>

            {roleError && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  lineHeight: 1.45,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, marginBottom: "4px" }}>
                  <Icon name="alert-circle" size={16} />
                  Cannot Downgrade Role
                </div>
                {roleError}
              </div>
            )}

            {roleSuccess && (
              <div
                style={{
                  backgroundColor: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  color: "#16a34a",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {roleSuccess}
              </div>
            )}

            {isSuperAdmin ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "13px", color: "var(--color-admin-text)" }}>
                  Other active Super Admins:{" "}
                  <strong>
                    {checkingSuperAdmins
                      ? "Checking..."
                      : otherSuperAdmins.length > 0
                      ? `${otherSuperAdmins.length} other (${otherSuperAdmins.map((o) => o.email).join(", ")})`
                      : "None (You are the sole Super Admin)"}
                  </strong>
                </div>

                {otherSuperAdmins.length === 0 && !checkingSuperAdmins && (
                  <p style={{ fontSize: "12px", color: "#f59e0b", margin: 0, fontWeight: 600 }}>
                    ⚠️ To downgrade yourself, navigate to User Management and promote another administrator to Super Admin first.
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={otherSuperAdmins.length === 0 || checkingSuperAdmins || roleLoading}
                    loading={roleLoading}
                    onClick={handleDowngradeSelf}
                  >
                    Downgrade to Administrator
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-admin-muted)" }}>
                You are currently an Administrator. Only a Super Administrator can promote your account.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AdminProfileModal;
