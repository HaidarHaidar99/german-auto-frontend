import React, { useState } from "react";
import Icon from "../common/Icon";

/**
 * German Auto — CinematicImage Component
 * Subtle depth zoom, graceful loading fade-in, and neutral fallback.
 */

export function CinematicImage({
  src,
  alt = "Automotive Media",
  aspectRatio,
  zoomOnHover = true,
  loading = "lazy",
  objectFit = "cover",
  className = "",
  style = {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`cinematic-image-fallback ${className}`.trim()}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "160px",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-xs)",
          color: "var(--color-text-subtle)",
          border: "1px solid var(--color-border-subtle)",
          ...style,
        }}
        {...props}
      >
        <Icon name="image" size={32} />
        <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          {alt || "Kein Medium verfügbar"}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        aspectRatio,
        overflow: "hidden",
        backgroundColor: "var(--color-surface)",
        ...style,
      }}
      className={`cinematic-image-wrapper ${className}`.trim()}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          opacity: isLoaded ? 1 : 0,
          transition: `opacity var(--duration-smooth) var(--ease-smooth), transform var(--duration-smooth) var(--ease-cinematic)`,
          transform: zoomOnHover ? "scale(1)" : "none",
        }}
      />
    </div>
  );
}

export default CinematicImage;
