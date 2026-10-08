import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../common/Icon";

export function AccountEmptyState({
  icon = "heart",
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
      className={`account-empty-state surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px dashed var(--color-border)",
        padding: "clamp(var(--space-xl), 5vw, var(--space-2xl))",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "rgba(212, 175, 55, 0.14)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          color: "var(--color-secondary, #D4AF37)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={22} />
      </div>

      <div style={{ maxWidth: "420px" }}>
        {title && (
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text)",
              margin: "0 0 var(--space-2xs) 0",
            }}
          >
            {title}
          </h3>
        )}
        {message && (
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
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

export default AccountEmptyState;
