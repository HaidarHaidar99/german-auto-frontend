import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

/**
 * SettingsPreviewButton — Safely opens the public page in a new tab for preview.
 */
export function SettingsPreviewButton({
  url = "/",
  label,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handlePreview = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePreview}
      className={className}
      style={{
        fontSize: "var(--font-size-xs)",
        ...style,
      }}
    >
      <Icon name="eye" size={14} style={{ marginRight: "6px" }} />
      {label || t("previewPage", { defaultValue: "Vorschau öffnen" })}
    </Button>
  );
}

export default SettingsPreviewButton;
