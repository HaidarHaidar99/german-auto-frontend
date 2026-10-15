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
  fetchPriority,
  decoding = "async",
  objectFit = "cover",
  className = "",
  style = {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const priority = fetchPriority || (loading === "eager" ? "high" : "auto");

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
        decoding={decoding}
        fetchPriority={priority}
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0 && !isLoaded) {
            setIsLoaded(true);
          }
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          opacity: isLoaded ? 1 : (loading === "eager" ? 0.7 : 0),
          transition: "opacity 0.25s ease-out, transform var(--duration-smooth) var(--ease-cinematic)",
          transform: zoomOnHover ? "scale(1)" : "none",
        }}
      />
    </div>
  );
}

export default CinematicImage;
