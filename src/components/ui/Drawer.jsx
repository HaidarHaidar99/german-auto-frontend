import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";

/**
 * German Auto — Accessible Slide-Over Drawer / Bottom Sheet
 * Used for responsive mobile navigation and mobile vehicle filtering.
 * Uses React Portal to mount to document.body and prevent transform context clipping.
 */

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  className = "",
  closeOnBackdropClick = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }

    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isLeft = position === "left";

  const drawerNode = (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Panel"}
        className={`drawer-panel ${isLeft ? "drawer-panel-left" : ""} ${className}`.trim()}
        style={{
          left: isLeft ? 0 : "auto",
          right: isLeft ? "auto" : 0,
          borderLeft: isLeft ? "none" : "1px solid var(--color-admin-border, var(--color-border))",
          borderRight: isLeft ? "1px solid var(--color-admin-border, var(--color-border))" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--color-admin-border, var(--color-border-subtle))",
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
                color: "var(--color-admin-text, inherit)",
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

  return typeof document !== "undefined" ? createPortal(drawerNode, document.body) : drawerNode;
}

export default Drawer;
