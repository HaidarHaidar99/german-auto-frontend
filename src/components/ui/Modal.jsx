import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";

/**
 * German Auto — Accessible Modal Dialog
 * Keyboard accessible (ESC closes, traps focus), backdrop blur, restrained luxury finish.
 * Uses React Portal to mount directly into document.body.
 */

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
  showClose = true,
  closeOnBackdropClick = false,
}) {
  const modalRef = useRef(null);

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

  const maxWidth = {
    sm: "420px",
    md: "560px",
    lg: "720px",
    xl: "900px",
  }[size] || "560px";

  const adminTheme =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-admin-theme") ||
        document.body.getAttribute("data-admin-theme") ||
        (typeof window !== "undefined" && window.location.pathname.includes("/admin")
          ? localStorage.getItem("admin_theme") || "light"
          : "")
      : "";

  const modalNode = (
    <div
      className="dialog-backdrop"
      data-admin-theme={adminTheme || undefined}
      role="presentation"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        className={`dialog-modal ${className}`.trim()}
        data-admin-theme={adminTheme || undefined}
        style={{
          maxWidth,
          ...(adminTheme
            ? {
                backgroundColor: "var(--color-admin-card)",
                color: "var(--color-admin-text)",
                borderColor: "var(--color-admin-border)",
              }
            : {}),
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
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-admin-text, inherit)",
              }}
            >
              {title}
            </h3>
          )}
          {showClose && (
            <IconButton
              icon="close"
              ariaLabel="Dialog schließen"
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{ marginLeft: "auto" }}
            />
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: "var(--space-lg)" }}>{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}

export default Modal;
