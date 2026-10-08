import React from "react";

/**
 * German Auto — CarMediaFrame Component
 * Atmospheric automotive photography stage with radial floor gradient and subtle depth.
 */

export function CarMediaFrame({
  children,
  aspectRatio = "16-9",
  badge,
  action,
  className = "",
  style = {},
}) {
  const ratioClass = {
    "16-9": "media-frame-16-9",
    "21-9": "media-frame-21-9",
    "4-3": "media-frame-4-3",
  }[aspectRatio] || "media-frame-16-9";

  return (
    <div
      className={`media-frame ${ratioClass} car-media-stage ${className}`.trim()}
      style={{
        width: "100%",
        position: "relative",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-subtle)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}

      {/* Atmospheric Stage Floor Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-cinematic-mask)",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Top Left Badge Slot */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {badge}
        </div>
      )}

      {/* Top Right Action Slot (e.g. Favorite Button) */}
      {action && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "none",
            background: "transparent",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
}

export default CarMediaFrame;
