import React, { useRef, useState } from "react";
import IconButton from "../ui/IconButton";
import Icon from "../common/Icon";

/**
 * German Auto — VideoMedia Component
 * Performance-safe HTML5 video with controls overlay and poster fallback.
 */

export function VideoMedia({
  src,
  poster,
  autoPlay = true,
  loop = true,
  muted: initialMuted = true,
  aspectRatio = "16-9",
  className = "",
  style = {},
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!src || hasError) {
    return (
      <div
        className={`media-frame media-frame-${aspectRatio} ${className}`.trim()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-subtle)",
          gap: "var(--space-xs)",
          border: "1px solid var(--color-border-subtle)",
          ...style,
        }}
      >
        <Icon name="video" size={36} />
        <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          Kein Videomedium hinterlegt
        </span>
      </div>
    );
  }

  return (
    <div
      className={`media-frame media-frame-${aspectRatio} ${className}`.trim()}
      style={{ position: "relative", ...style }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={initialMuted}
        playsInline
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Floating Control Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "var(--space-md)",
          right: "var(--space-md)",
          display: "flex",
          gap: "var(--space-xs)",
          zIndex: 10,
        }}
      >
        <IconButton
          icon={isPlaying ? "pause" : "play"}
          ariaLabel={isPlaying ? "Video pausieren" : "Video abspielen"}
          variant="secondary"
          size="sm"
          onClick={togglePlay}
          style={{
            backgroundColor: "rgba(9, 10, 12, 0.75)",
            backdropFilter: "blur(8px)",
          }}
        />
        <IconButton
          icon={isMuted ? "volume-x" : "volume"}
          ariaLabel={isMuted ? "Ton einschalten" : "Ton stummschalten"}
          variant="secondary"
          size="sm"
          onClick={toggleMute}
          style={{
            backgroundColor: "rgba(9, 10, 12, 0.75)",
            backdropFilter: "blur(8px)",
          }}
        />
      </div>
    </div>
  );
}

export default VideoMedia;
