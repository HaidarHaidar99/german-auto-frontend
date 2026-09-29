import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import Button from "../../components/ui/Button";
import Input from "../../components/forms/Input";
import Icon from "../../components/common/Icon";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/auth/auth.service";
import adminUsersService from "../../services/adminUsers/adminUsers.service";

export function AdminProfilePage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, refreshUser } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Active Tab: 'profile' | 'security' | 'role'
  const [activeTab, setActiveTab] = useState("profile");

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
    document.title = "Admin Profile | ADMINCORE";
    if (isSuperAdmin) {
      checkOtherSuperAdmins();
    }
  }, [isSuperAdmin]);

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
      setPasswordError(t("errorCurrentPasswordRequired", { defaultValue: "Bitte geben Sie Ihr aktuelles Passwort ein." }));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t("errorPasswordMinLength", { defaultValue: "Das neue Passwort muss mindestens 8 Zeichen lang sein." }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("errorPasswordMismatch", { defaultValue: "Die neuen Passwörter stimmen nicht überein." }));
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
      setPasswordError(
        err?.message ||
        t("errorChangePasswordFailed", { defaultValue: "Fehler beim Aktualisieren des Passworts. Bitte prüfen Sie Ihr aktuelles Passwort." })
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDowngradeSelf = async () => {
    if (otherSuperAdmins.length === 0) {
      setRoleError(
        t("errorSoleSuperAdmin", {
          defaultValue: "Sie können Ihre Rolle nicht herabstufen. Sie sind derzeit der einzige Super-Administrator. Befördern Sie zuerst einen anderen Benutzer.",
        })
      );
      return;
    }

    if (
      !window.confirm(
        t("confirmDowngrade", {
          defaultValue: "Sind Sie sicher, dass Sie Ihre Rolle auf Administrator herabstufen möchten? Sie verlieren dadurch Super-Admin-Rechte.",
        })
      )
    ) {
      return;
    }

    try {
      setRoleLoading(true);
      setRoleError("");
      await adminUsersService.updateRole(user.id, "ADMIN");
      setRoleSuccess(t("downgradeSuccess", { defaultValue: "Ihre Rolle wurde erfolgreich auf Administrator herabgestuft." }));
      if (refreshUser) await refreshUser();
    } catch (err) {
      setRoleError(err?.message || t("errorUpdateRoleFailed", { defaultValue: "Fehler beim Aktualisieren der Rolle." }));
    } finally {
      setRoleLoading(false);
    }
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Administrator";
  const avatarInitial = (displayName || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-profile-page" style={{ position: "relative" }}>
      {/* Header */}
      <AdminPageHeader
        title={t("adminProfileTitle", { defaultValue: "Admin-Profil & Kontoeinstellungen" })}
        subtitle={t("adminProfileSubtitle", {
          defaultValue: "Verwalten Sie Ihre persönlichen Kontodaten, Sicherheitsoptionen und Administratorrollen",
        })}
        badge={
          isSuperAdmin ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                color: "#d97706",
                border: "1px solid rgba(245, 158, 11, 0.35)",
              }}
            >
              <Icon name="award" size={12} />
              SUPER ADMIN
            </span>
          ) : (
            <Badge variant="secondary" size="sm">
              ADMIN
            </Badge>
          )
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Profile Identity Card */}
        <div
          style={{
            backgroundColor: "var(--color-admin-card, #ffffff)",
            borderRadius: "16px",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px", minWidth: 0 }}>
            {/* White Circle Initial Avatar */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--color-admin-card, #ffffff)",
                border: "2px solid var(--color-admin-accent, #2563eb)",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-admin-accent, #2563eb)",
                fontWeight: 800,
                fontSize: "26px",
                flexShrink: 0,
              }}
            >
              {avatarInitial}
            </div>

            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--color-admin-text, #0f172a)",
                  letterSpacing: "-0.3px",
                }}
              >
                {displayName}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--color-admin-muted, #64748b)",
                  flexWrap: "wrap",
                }}
              >
                <span>{user?.email}</span>
                <span>•</span>
                <span
                  style={{
                    color: isSuperAdmin ? "#d97706" : "var(--color-admin-accent, #2563eb)",
                    fontWeight: 700,
                  }}
                >
                  {isSuperAdmin ? "Super Administrator" : "Administrator"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--color-admin-border-subtle, #f8fafc)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#16a34a",
              }}
            >
              <Icon name="check-circle" size={15} />
              <span>Konto aktiv & verifiziert</span>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--color-admin-card, #ffffff)",
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            overflowX: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "profile" ? "var(--color-admin-accent, #2563eb)" : "transparent",
              color: activeTab === "profile" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="user" size={16} />
            <span>Kontoinformationen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "security" ? "var(--color-admin-accent, #2563eb)" : "transparent",
              color: activeTab === "security" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="lock" size={16} />
            <span>Passwort ändern</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("role")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "role" ? "var(--color-admin-accent, #2563eb)" : "transparent",
              color: activeTab === "role" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="shield" size={16} />
            <span>Rollenverwaltung</span>
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            <AdminSectionCard title="Stammdaten">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    Vollständiger Name
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-admin-text)" }}>
                    {user?.full_name || "—"}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    E-Mail-Adresse
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-admin-text)", wordBreak: "break-all" }}>
                    {user?.email}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    System-Rolle
                  </span>
                  <div>
                    {isSuperAdmin ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          backgroundColor: "rgba(245, 158, 11, 0.12)",
                          color: "#d97706",
                          border: "1px solid rgba(245, 158, 11, 0.35)",
                        }}
                      >
                        <Icon name="award" size={12} />
                        SUPER ADMIN
                      </span>
                    ) : (
                      <Badge variant="secondary" size="sm">
                        ADMIN
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Sicherheit & Sitzung">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    Benutzer-ID
                  </span>
                  <code
                    style={{
                      fontSize: "12px",
                      padding: "6px 10px",
                      backgroundColor: "var(--color-admin-border-subtle)",
                      borderRadius: "6px",
                      border: "1px solid var(--color-admin-border)",
                      color: "var(--color-admin-text)",
                      wordBreak: "break-all",
                    }}
                  >
                    {user?.id || "—"}
                  </code>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    E-Mail Verifizierung
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "13px", fontWeight: 600 }}>
                    <Icon name="check" size={16} />
                    <span>Bestätigt</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-admin-muted)" }}>
                    Sicherheitsstatus
                  </span>
                  <div style={{ fontSize: "13px", color: "var(--color-admin-muted)" }}>
                    Multi-Faktor & Token-Invalidierung aktiv
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === "security" && (
          <div style={{ maxWidth: "600px" }}>
            <AdminSectionCard title="Passwort aktualisieren">
              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {passwordSuccess && (
                  <div
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#16a34a",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Icon name="check-circle" size={16} />
                    <span>Passwort erfolgreich aktualisiert!</span>
                  </div>
                )}

                {passwordError && (
                  <div
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Icon name="alert-circle" size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <Input
                  label="Aktuelles Passwort"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Neues Passwort (mind. 8 Zeichen)"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Neues Passwort bestätigen"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <Button type="submit" variant="primary" loading={passwordLoading}>
                    Passwort speichern
                  </Button>
                </div>
              </form>
            </AdminSectionCard>
          </div>
        )}

        {/* Tab 3: Role Management */}
        {activeTab === "role" && (
          <div style={{ maxWidth: "700px" }}>
            <AdminSectionCard title="Super-Administrator Richtlinie">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    backgroundColor: "var(--color-admin-border-subtle, #f8fafc)",
                    borderRadius: "12px",
                    border: "1px solid var(--color-admin-border, #e2e8f0)",
                    padding: "16px",
                  }}
                >
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--color-admin-text)", fontWeight: 700 }}>
                    Sicherheitsregel für Super-Administratoren
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--color-admin-muted)", lineHeight: 1.5 }}>
                    Ein Super-Administrator kann sich nur dann selbst auf den Status eines Administrators herabstufen, wenn mindestens ein weiterer aktiver Super-Administrator im System existiert. Dadurch wird sichergestellt, dass das System niemals ohne Hauptadministrator verbleibt.
                  </p>
                </div>

                {roleError && (
                  <div
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      padding: "14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, marginBottom: "4px" }}>
                      <Icon name="alert-circle" size={16} />
                      Herabstufung nicht möglich
                    </div>
                    {roleError}
                  </div>
                )}

                {roleSuccess && (
                  <div
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#16a34a",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {roleSuccess}
                  </div>
                )}

                {isSuperAdmin ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ fontSize: "13px", color: "var(--color-admin-text)" }}>
                      Andere aktive Super-Administratoren:{" "}
                      <strong>
                        {checkingSuperAdmins
                          ? "Wird geprüft..."
                          : otherSuperAdmins.length > 0
                          ? `${otherSuperAdmins.length} (${otherSuperAdmins.map((o) => o.email).join(", ")})`
                          : "Keine (Sie sind der einzige Super-Admin)"}
                      </strong>
                    </div>

                    {otherSuperAdmins.length === 0 && !checkingSuperAdmins && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          color: "#b45309",
                          fontSize: "12px",
                          fontWeight: 600,
                          lineHeight: 1.45,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <Icon name="alert-circle" size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#d97706" }} />
                        <span>
                          Um sich selbst herabzustufen, navigieren Sie zur <strong>Benutzerverwaltung</strong> und befördern Sie zuerst einen anderen Administrator zum Super-Admin.
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                      <Button
                        type="button"
                        variant="primary"
                        disabled={otherSuperAdmins.length === 0 || checkingSuperAdmins || roleLoading}
                        loading={roleLoading}
                        onClick={handleDowngradeSelf}
                        style={{
                          backgroundColor: otherSuperAdmins.length === 0 ? undefined : "var(--color-error)",
                          borderColor: otherSuperAdmins.length === 0 ? undefined : "var(--color-error)",
                          color: "#ffffff",
                        }}
                      >
                        Auf Administrator herabstufen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "13px", color: "var(--color-admin-muted)" }}>
                    Sie besitzen aktuell den Status Administrator. Nur ein Super-Administrator kann Ihre Berechtigungen anpassen.
                  </div>
                )}
              </div>
            </AdminSectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfilePage;
