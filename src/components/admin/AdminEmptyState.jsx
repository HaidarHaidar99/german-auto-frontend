import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../common/Icon";

export function AdminEmptyState({
  icon = "inbox",
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`admin-empty-state surface-card ${className}`.trim()}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.015)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-admin-border)",
        padding: "clamp(var(--space-xl), 4vw, var(--space-2xl))",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-sm)",
        ...style,
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "var(--color-admin-accent-subtle)",
          color: "var(--color-admin-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-2xs)",
        }}
      >
        <Icon name={icon} size={20} />
      </div>

      <div style={{ maxWidth: "420px" }}>
        {title && (
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              color: "var(--color-admin-text)",
              margin: "0 0 4px 0",
            }}
          >
            {title}
          </h3>
        )}
        {message && (
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-admin-muted)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {message}
          </p>
        )}
      </div>

      {(actionLabel && (actionTo || onAction)) && (
        <div style={{ marginTop: "var(--space-xs)" }}>
          {actionTo ? (
            <Button as={Link} to={actionTo} variant="outline" size="sm">
              {actionLabel}
            </Button>
          ) : (
            <Button onClick={onAction} variant="outline" size="sm">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminEmptyState;
