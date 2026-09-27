import React from "react";

/**
 * German Auto — MediaFrame Component
 * Controlled cinematic aspect ratios with restrained luxury edge framing.
 */

export function MediaFrame({
  children,
  aspectRatio = "16-9",
  overlay,
  className = "",
  style = {},
  ...props
}) {
  const ratioClass = {
    "16-9": "media-frame-16-9",
    "21-9": "media-frame-21-9",
    "4-3": "media-frame-4-3",
    square: "media-frame-square",
    auto: "",
  }[aspectRatio] || "media-frame-16-9";

  return (
    <div
      className={`media-frame ${ratioClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
      {overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            ...overlay,
          }}
        />
      )}
    </div>
  );
}

export default MediaFrame;
