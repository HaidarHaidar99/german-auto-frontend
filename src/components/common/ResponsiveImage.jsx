import React, { useState } from "react";

export function ResponsiveImage({
  src,
  alt = "",
  aspectRatio = "16/9",
  objectFit = "cover",
  loading = "lazy",
  className = "",
  style = {},
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const containerStyle = {
    position: "relative",
    width: "100%",
    aspectRatio,
    overflow: "hidden",
    backgroundColor: "var(--color-card)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit,
    opacity: loaded ? 1 : 0,
    transition: "opacity var(--transition-normal)",
    position: "absolute",
    top: 0,
    left: 0,
  };

  if (!src || error) {
    return (
      <div style={containerStyle} className={`responsive-image-placeholder ${className}`}>
        <span style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          {error ? "Bild konnte nicht geladen werden" : "Kein Bild verfügbar"}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={`responsive-image-container ${className}`}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--color-surface-hover)",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={imgStyle}
        {...props}
      />
    </div>
  );
}

export default ResponsiveImage;
