import React, { useRef, useState, useEffect, useId } from "react";
import Icon from "../common/Icon";
import Button from "../ui/Button";

/**
 * German Auto — Premium Automotive File Upload Component
 * Drag-and-drop support, accessible file selection, image thumbnails preview,
 * object URL memory cleanup, and validation feedback.
 */
export function FileUpload({
  label,
  accept = "image/jpeg,image/png,image/webp,image/avif",
  multiple = false,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  files: controlledFiles,
  onFilesSelected,
  dropText = "Dateien hier ablegen oder durchsuchen",
  helperText,
  removeText = "Entfernen",
  error,
  disabled = false,
  className = "",
  style = {},
}) {
  const inputRef = useRef(null);
  const generatedId = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalFiles, setInternalFiles] = useState([]);
  const [localError, setLocalError] = useState(null);

  const selectedFiles = controlledFiles !== undefined ? controlledFiles : internalFiles;
  const displayError = error || localError;

  // Manage object URLs for memory safety
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    const urls = {};
    selectedFiles.forEach((file, idx) => {
      if (file && file.type && file.type.startsWith("image/")) {
        urls[idx] = URL.createObjectURL(file);
      }
    });
    setPreviewUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
    };
  }, [selectedFiles]);

  const handleFiles = (filesList) => {
    setLocalError(null);
    const newFiles = Array.from(filesList);

    if (newFiles.length > maxFiles) {
      setLocalError(`Maximal ${maxFiles} Dateien erlaubt.`);
      return;
    }

    const invalidType = newFiles.find((f) => {
      const allowed = accept.split(",").map((t) => t.trim());
      return !allowed.some((a) => f.type === a || (a.endsWith("/*") && f.type.startsWith(a.replace("/*", ""))));
    });

    if (invalidType) {
      setLocalError(`Ungültiger Dateityp (${invalidType.type || invalidType.name}).`);
      return;
    }

    const invalidSize = newFiles.find((f) => f.size > maxSizeBytes);
    if (invalidSize) {
      setLocalError(`Eine oder mehrere Dateien überschreiten das Limit von ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`);
      return;
    }

    setInternalFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setInternalFiles(updated);
    if (onFilesSelected) onFilesSelected(updated);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`form-field ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={generatedId} className="form-label">
          {label}
        </label>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{
          border: `2px dashed ${
            displayError
              ? "var(--color-error)"
              : isDragOver
              ? "var(--color-secondary)"
              : "var(--color-border)"
          }`,
          backgroundColor: isDragOver
            ? "var(--color-accent-subtle)"
            : "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md)",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all var(--duration-fast) var(--ease-smooth)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          id={generatedId}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-xs)" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-secondary)",
              marginBottom: "var(--space-2xs)",
            }}
          >
            <Icon name="upload" size={24} />
          </div>

          <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
            {dropText}
          </p>

          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
            {helperText || `Formate: ${accept.replace(/image\//g, "")} (max. ${Math.round(maxSizeBytes / 1024 / 1024)} MB)`}
          </span>
        </div>
      </div>

      {displayError && (
        <span className="form-helper is-error" style={{ display: "block", marginTop: "var(--space-2xs)" }}>
          {displayError}
        </span>
      )}

      {selectedFiles.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-sm)",
            marginTop: "var(--space-sm)",
          }}
        >
          {selectedFiles.map((file, idx) => {
            const previewUrl = previewUrls[idx];
            return (
              <div
                key={`${file.name}-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-xs)",
                  overflow: "hidden",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-sm)",
                      objectFit: "cover",
                      backgroundColor: "var(--color-card)",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="image" size={20} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--color-text)",
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div style={{ color: "var(--color-text-subtle)", fontSize: "var(--font-size-2xs)", marginTop: "2px" }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>

                <Button
                  variant="text"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  aria-label={`${removeText} ${file.name}`}
                  style={{
                    color: "var(--color-error)",
                    padding: "var(--space-2xs)",
                    minWidth: "auto",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="trash-2" size={16} />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
