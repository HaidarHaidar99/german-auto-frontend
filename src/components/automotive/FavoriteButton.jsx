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
  const isFav = controlledFavorite !== undefined ? controlledFavorite : internalFavorite;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggle) {
      onToggle(!isFav);
    } else {
      setInternalFavorite(!isFav);
    }
  };

  return (
    <button
      type="button"
      aria-label={isFav ? "Aus Favoriten entfernen" : ariaLabel}
      aria-pressed={isFav}
      onClick={handleClick}
      className={`favorite-button ${className}`.trim()}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "rgba(9, 10, 12, 0.7)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${isFav ? "var(--color-secondary)" : "rgba(255, 255, 255, 0.12)"}`,
        color: isFav ? "var(--color-secondary)" : "var(--color-text)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all var(--duration-fast) var(--ease-smooth)",
        transform: isFav ? "scale(1.05)" : "scale(1)",
        ...style,
      }}
    >
      <Icon name={isFav ? "heart-filled" : "heart"} size={16} />
    </button>
  );
}

export default FavoriteButton;
