import React from "react";
import AdminSectionCard from "../AdminSectionCard";
import SettingsSectionHeader from "./SettingsSectionHeader";

/**
 * SettingsSection — Card container for a CMS section.
 */
export function SettingsSection({
  title,
  subtitle,
  badge = null,
  previewUrl = null,
  sectionKey = null,
  onReset = null,
  resetLoading = false,
  headerActions = null,
  className = "",
  style = {},
  children,
}) {
  return (
    <AdminSectionCard className={`settings-section-card ${className}`.trim()} style={style}>
      <SettingsSectionHeader
        title={title}
        subtitle={subtitle}
        badge={badge}
        previewUrl={previewUrl}
        sectionKey={sectionKey}
        onReset={onReset}
        resetLoading={resetLoading}
        actions={headerActions}
      />
      <div className="settings-section-body" style={{ minWidth: 0 }}>
        {children}
      </div>
    </AdminSectionCard>
  );
}

export default SettingsSection;
