import React, { useState } from "react";
import Icon from "../common/Icon";

/**
 * German Auto — Automotive Favorite Toggle Button
 * Micro-interaction heart toggle with accessible state and glass backdrop.
 */

export function FavoriteButton({
  isFavorite: controlledFavorite,
  onToggle,
  ariaLabel = "Zu Favoriten hinzufügen",
  className = "",
  style = {},
}) {
  const [internalFavorite, setInternalFavorite] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
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

  return (
    <>
      <style>{`
        @keyframes favHeartPopOnly {
          0% { transform: scale(1); }
          35% { transform: scale(1.38); }
          70% { transform: scale(0.9); }
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
        onMouseDown={(e) => { e.stopPropagation(); }}
        onTouchStart={(e) => { e.stopPropagation(); }}
        className={`favorite-button ${isFav ? "is-favorite" : ""} ${className}`.trim()}
        style={{
          width: "36px",
          height: "36px",
          minWidth: "36px",
          minHeight: "36px",
          maxWidth: "36px",
          maxHeight: "36px",
          borderRadius: "50%",
          aspectRatio: "1 / 1",
          padding: 0,
          margin: 0,
          boxSizing: "border-box",
          backgroundColor: isFav ? "rgba(239, 68, 68, 0.18)" : "rgba(9, 10, 12, 0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${isFav ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
          color: isFav ? "#ef4444" : "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "none",
          filter: "none",
          transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
          transform: "none",
          outline: "none",
          flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center center",
            animation: isPopping ? "favHeartPopOnly 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
            willChange: "transform",
            lineHeight: 0,
          }}
        >
          <Icon name={isFav ? "heart-filled" : "heart"} size={17} color={isFav ? "#ef4444" : "currentColor"} />
        </span>
      </button>
    </>
  );
}

export default FavoriteButton;
