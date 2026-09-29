import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import SettingsField from "./SettingsField";

/**
 * MediaUploadField — Upload & preview component for branding assets and hero media.
 */
export function MediaUploadField({
  label,
  value, // current media URL (string)
  onChange, // (newUrl: string | null) => void
  onUpload, // (file: File) => Promise<{ url: string }>
  accept = "image/*",
  mediaType = "IMAGE", // "IMAGE" | "VIDEO"
  maxSizeMB = 5,
  helper,
  error,
  required = false,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);

  useEffect(() => {
    return () => {
      if (previewBlob) {
        URL.revokeObjectURL(previewBlob);
      }
    };
  }, [previewBlob]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = "";

    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(
        t("fileTooLarge", {
          defaultValue: `Die Datei überschreitet die maximale Größe von ${maxSizeMB} MB.`,
          maxSize: maxSizeMB,
        })
      );
      return;
    }

    setUploadError(null);

    // Create local blob preview
    if (previewBlob) URL.revokeObjectURL(previewBlob);
    const objectUrl = URL.createObjectURL(file);
    setPreviewBlob(objectUrl);

    if (onUpload) {
      try {
        setUploading(true);
        const res = await onUpload(file);
        const uploadedUrl = res?.data?.url || res?.url;
        if (uploadedUrl) {
          onChange?.(uploadedUrl);
        }
      } catch (err) {
        setUploadError(err?.message || "Fehler beim Hochladen der Datei.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemove = () => {
    if (previewBlob) {
      URL.revokeObjectURL(previewBlob);
      setPreviewBlob(null);
    }
    setUploadError(null);
    onChange?.(null);
  };

  const activeUrl = previewBlob || value;
  const isVideo = mediaType === "VIDEO" || (activeUrl && (activeUrl.endsWith(".mp4") || activeUrl.endsWith(".webm")));

  return (
    <SettingsField
      label={label}
      helper={helper || `Erlaubt: ${accept} (max. ${maxSizeMB} MB)`}
      error={error || uploadError}
      required={required}
      className={className}
      style={style}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        {activeUrl ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-md)",
              padding: "var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.12))",
              borderRadius: "var(--radius-sm, 6px)",
              overflow: "hidden",
            }}
          >
            {/* Preview Asset */}
            <div
              style={{
                width: "80px",
                height: "60px",
                borderRadius: "var(--radius-xs, 4px)",
                overflow: "hidden",
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {isVideo ? (
                <video
                  src={activeUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={activeUrl}
                  alt={label}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-admin-text, #ffffff)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "monospace",
                }}
              >
                {activeUrl}
              </p>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-admin-muted, var(--color-text-muted))",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                {uploading ? t("uploading", { defaultValue: "Wird hochgeladen..." }) : t("configuredAsset", { defaultValue: "Aktives Medium" })}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: "var(--font-size-xs)", padding: "4px 10px" }}
              >
                {t("replace", { defaultValue: "Ersetzen" })}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={handleRemove}
                style={{
                  fontSize: "var(--font-size-xs)",
                  padding: "4px 8px",
                  color: "var(--color-error, #ef4444)",
                }}
              >
                <Icon name="trash" size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${label} Datei hochladen`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-xs)",
              padding: "var(--space-lg) var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed var(--color-admin-border, rgba(255, 255, 255, 0.2))",
              borderRadius: "var(--radius-sm, 6px)",
              cursor: uploading ? "wait" : "pointer",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
          >
            <Icon
              name="upload"
              size={22}
              style={{ color: "var(--color-primary, var(--color-text))" }}
            />
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                color: "var(--color-admin-text, #ffffff)",
              }}
            >
              {uploading
                ? t("uploading", { defaultValue: "Wird hochgeladen..." })
                : t("clickToUploadMedia", { defaultValue: "Datei auswählen oder ablegen" })}
            </span>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-muted, var(--color-text-muted))",
              }}
            >
              {maxSizeMB} MB max. • {accept}
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </div>
    </SettingsField>
  );
}

export default MediaUploadField;
