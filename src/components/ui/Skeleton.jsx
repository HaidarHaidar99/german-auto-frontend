import React from "react";

export function Skeleton({
  width = "100%",
  height = "1.25rem",
  borderRadius = "var(--radius-md)",
  style = {},
  className = "",
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "var(--color-surface-hover)",
        animation: "skeleton-pulse 1.5s ease-in-out infinite",
        ...style,
      }}
      className={`skeleton-loader ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

export default Skeleton;
