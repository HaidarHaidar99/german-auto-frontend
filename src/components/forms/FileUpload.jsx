import React, { useRef, useState, useId } from "react";
import Icon from "../common/Icon";
import Button from "../ui/Button";

/**
 * German Auto — File Upload Component
 * Drag-and-drop support, accessible file selection, preview, and error display.
 */

export function FileUpload({
  label,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  onFilesSelected,
  helperText,
  error,
  disabled = false,
  className = "",
  style = {},
}) {
  const inputRef = useRef(null);
  const generatedId = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localError, setLocalError] = useState(null);

  const displayError = error || localError;

  const handleFiles = (filesList) => {
    setLocalError(null);
    const files = Array.from(filesList);

    if (files.length > maxFiles) {
      setLocalError(`Maximal ${maxFiles} Dateien erlaubt.`);
      return;
    }

    const invalidSize = files.find((f) => f.size > maxSizeBytes);
    if (invalidSize) {
      setLocalError(`Eine oder mehrere Dateien überschreiten das Limit von ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`);
      return;
    }

    setSelectedFiles(files);
    if (onFilesSelected) {
      onFilesSelected(files);
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
    setSelectedFiles(updated);
    if (onFilesSelected) onFilesSelected(updated);
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
          padding: "var(--space-xl) var(--space-md)",
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
            Dateien hier ablegen oder durchsuchen
          </p>

          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
            {helperText || `Formate: ${accept.replace(/image\//g, "")} (max. ${Math.round(maxSizeBytes / 1024 / 1024)}MB)`}
          </span>
        </div>
      </div>

      {displayError && (
        <span className="form-helper is-error">{displayError}</span>
      )}

      {selectedFiles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xs)", marginTop: "var(--space-xs)" }}>
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-xs) var(--space-md)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", overflow: "hidden" }}>
                <Icon name="image" size={16} style={{ color: "var(--color-secondary)" }} />
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <span style={{ color: "var(--color-text-subtle)" }}>
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
              <Button
                variant="text"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                style={{ color: "var(--color-error)", padding: 0 }}
              >
                Entfernen
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
