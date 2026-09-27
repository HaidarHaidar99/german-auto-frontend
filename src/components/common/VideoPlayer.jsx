import React from "react";

export function VideoPlayer({
  src,
  poster,
  aspectRatio = "16/9",
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  className = "",
  style = {},
  ...props
}) {
  const containerStyle = {
    position: "relative",
    width: "100%",
    aspectRatio,
    overflow: "hidden",
    backgroundColor: "var(--color-card)",
    borderRadius: "var(--radius-md)",
    ...style,
  };

  if (!src) {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className={`video-placeholder ${className}`}
      >
        <span style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          Kein Video verfügbar
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={`video-player-container ${className}`}>
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        {...props}
      />
    </div>
  );
}

export default VideoPlayer;
