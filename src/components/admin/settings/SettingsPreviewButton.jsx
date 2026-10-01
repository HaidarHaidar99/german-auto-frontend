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
    try {
      const fullUrl = url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.open(url, "_blank");
    }
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
