import React, { useEffect } from "react";
import IconButton from "./IconButton";

/**
 * German Auto — Accessible Slide-Over Drawer
 * Used for responsive mobile navigation and mobile vehicle filtering.
 */

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  className = "",
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isLeft = position === "left";

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Panel"}
        className={`drawer-panel ${className}`.trim()}
        style={{
          left: isLeft ? 0 : "auto",
          right: isLeft ? "auto" : 0,
          borderLeft: isLeft ? "none" : "1px solid var(--color-border)",
          borderRight: isLeft ? "1px solid var(--color-border)" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--color-border-subtle)",
            minHeight: "var(--header-height)",
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-wide)",
              }}
            >
              {title}
            </h3>
          )}
          <IconButton
            icon="close"
            ariaLabel="Panel schließen"
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ marginLeft: "auto" }}
          />
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-lg)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Drawer;
