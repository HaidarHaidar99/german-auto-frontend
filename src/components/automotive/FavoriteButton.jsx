import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "../common/Icon";

/**
 * German Auto — Automotive Favorite Toggle Button
 * Micro-interaction heart toggle with luxury frosted glass circular badge.
 * Strictly zero outside shadows in all themes.
 */

export function FavoriteButton({
  isFavorite: controlledFavorite,
  onToggle,
  ariaLabel = "Zu Favoriten hinzufügen",
  className = "",
  size = 38,
  style = {},
}) {
  const { isDark } = useTheme?.() || { isDark: true };
  const [internalFavorite, setInternalFavorite] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isFav = controlledFavorite !== undefined ? controlledFavorite : internalFavorite;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 240);

    if (onToggle) {
      onToggle(!isFav);
    } else {
      setInternalFavorite(!isFav);
    }
  };

  // Color tokens tuned for luxury automotive imagery
  let bg;
  let border;
  let iconColor;

  if (isDark) {
    if (isFav) {
      bg = isHovered ? "rgba(36, 18, 24, 0.96)" : "rgba(22, 20, 28, 0.92)";
      border = "#ef4444";
      iconColor = "#ef4444";
    } else if (isHovered) {
      bg = "rgba(28, 32, 44, 0.94)";
      border = "rgba(239, 68, 68, 0.55)";
      iconColor = "#ef4444";
    } else {
      bg = "rgba(18, 20, 26, 0.86)";
      border = "rgba(255, 255, 255, 0.24)";
      iconColor = "#ffffff";
    }
  } else {
    // Light Mode
    if (isFav) {
      bg = isHovered ? "#fef2f2" : "#ffffff";
      border = "#ef4444";
      iconColor = "#ef4444";
    } else if (isHovered) {
      bg = "#ffffff";
      border = "rgba(239, 68, 68, 0.45)";
      iconColor = "#ef4444";
    } else {
      bg = "rgba(255, 255, 255, 0.92)";
      border = "rgba(0, 0, 0, 0.12)";
      iconColor = "#1e293b";
    }
  }

  const transformScale = isPressed
    ? "scale(0.92)"
    : isHovered
    ? "scale(1.06)"
    : "scale(1)";

  return (
    <>
      <style>{`
        @keyframes favHeartPopOnly {
          0% { transform: scale(1); }
          35% { transform: scale(1.36); }
          70% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        .favorite-button,
        .favorite-button:hover,
        .favorite-button:active,
        .favorite-button:focus,
        .favorite-button:focus-visible,
        .favorite-button.is-favorite {
          box-shadow: none !important;
          filter: none !important;
          text-shadow: none !important;
          border-radius: 50% !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
      `}</style>
      <button
        type="button"
        aria-label={isFav ? "Aus Favoriten entfernen" : ariaLabel}
        aria-pressed={isFav}
        onClick={handleClick}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsPressed(true);
        }}
        onMouseUp={() => setIsPressed(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setIsPressed(true);
        }}
        onTouchEnd={() => setIsPressed(false)}
        className={`favorite-button ${isFav ? "is-favorite" : ""} ${className}`.trim()}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          borderRadius: "50%",
          aspectRatio: "1 / 1",
          padding: 0,
          margin: 0,
          boxSizing: "border-box",
          backgroundColor: bg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1.5px solid ${border}`,
          color: iconColor,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "none",
          filter: "none",
          transition: "background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: transformScale,
          outline: "none",
          flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center center",
            animation: isPopping ? "favHeartPopOnly 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
            willChange: "transform",
            lineHeight: 0,
          }}
        >
          <Icon
            name={isFav ? "heart-filled" : "heart"}
            size={Math.round(size * 0.48)}
            color={iconColor}
            strokeWidth={2}
          />
        </span>
      </button>
    </>
  );
}

export default FavoriteButton;
