import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import IconButton from "../ui/IconButton";
import VideoMedia from "../media/VideoMedia";
import { isReducedMotion } from "../../utils/animation";

/**
 * German Auto — CarMediaGallery Component
 * Cinematic primary media stage, thumbnail navigation, video, 360° interactive viewer,
 * 3D model container, and fullscreen lightbox modal with keyboard and touch support.
 */
export function CarMediaGallery({ car, className = "", style = {} }) {
  const { t } = useTranslation(["cars", "common"]);

  // Extract all media safely
  const media = car?.media || {};
  const galleryImages = [
    ...(Array.isArray(media.gallery) ? media.gallery : []),
    ...(Array.isArray(car?.images) ? car.images : []),
  ].filter(Boolean);

  // Unique photos list
  const list = [];
  if (media.thumbnail && !galleryImages.includes(media.thumbnail)) {
    list.push(media.thumbnail);
  } else if (car?.image_url && !galleryImages.includes(car.image_url)) {
    list.push(car.image_url);
  }
  list.push(...galleryImages);
  const uniquePhotos = Array.from(new Set(list));

  const hasPhotos = uniquePhotos.length > 0;
  const hasVideo = Boolean(media.video);
  const images360 = Array.isArray(media.images_360) ? media.images_360.filter(Boolean) : [];
  const has360 = images360.length > 0;
  const has3D = Boolean(media.model_3d);

  // Determine available tabs
  const availableTabs = [];
  if (hasPhotos) availableTabs.push("photos");
  if (hasVideo) availableTabs.push("video");
  if (has360) availableTabs.push("360");
  if (has3D) availableTabs.push("3d");

  const [activeTab, setActiveTab] = useState(() => (hasPhotos ? "photos" : availableTabs[0] || "photos"));
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // 360 scrubber state
  const [frame360Idx, setFrame360Idx] = useState(0);
  const isDragging360 = useRef(false);
  const startX360 = useRef(0);

  // Touch swipe support for photos
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handlePrevPhoto = useCallback(() => {
    setActivePhotoIdx((prev) => (prev === 0 ? uniquePhotos.length - 1 : prev - 1));
  }, [uniquePhotos.length]);

  const handleNextPhoto = useCallback(() => {
    setActivePhotoIdx((prev) => (prev === uniquePhotos.length - 1 ? 0 : prev + 1));
  }, [uniquePhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while lightbox is active
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, handlePrevPhoto, handleNextPhoto]);

  // Touch handlers for mobile photo swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 360 Mouse / Touch Scrubber
  const handle360MouseDown = (e) => {
    isDragging360.current = true;
    startX360.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handle360MouseMove = (e) => {
    if (!isDragging360.current || images360.length === 0) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = currentX - startX360.current;
    if (Math.abs(delta) > 15) {
      const step = delta > 0 ? -1 : 1;
      setFrame360Idx((prev) => {
        const next = (prev + step + images360.length) % images360.length;
        return next;
      });
      startX360.current = currentX;
    }
  };

  const handle360MouseUp = () => {
    isDragging360.current = false;
  };

  // If absolutely no media is available
  if (availableTabs.length === 0) {
    return (
      <div
        className={`car-media-empty ${className}`.trim()}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm)",
          color: "var(--color-text-subtle)",
          ...style,
        }}
      >
        <Icon name="image" size={48} />
        <span style={{ fontSize: "var(--font-size-sm)", letterSpacing: "var(--tracking-wider)" }}>
          {t("noMedia")}
        </span>
      </div>
    );
  }

  const currentPhotoSrc = uniquePhotos[activePhotoIdx];
  const vehicleAlt = `${car.brand || ""} ${car.model || ""} ${car.title || ""}`.trim() || t("details");

  return (
    <div className={`car-media-gallery ${className}`.trim()} style={{ width: "100%", ...style }}>
      {/* Media Type Tabs (when multiple media modalities exist) */}
      {availableTabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Media types"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            marginBottom: "var(--space-sm)",
            overflowX: "auto",
            paddingBottom: "var(--space-2xs)",
          }}
        >
          {hasPhotos && (
            <button
              role="tab"
              aria-selected={activeTab === "photos"}
              onClick={() => setActiveTab("photos")}
              className={`media-tab-btn ${activeTab === "photos" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                borderColor: activeTab === "photos" ? "var(--color-secondary)" : "var(--color-border-subtle)",
                backgroundColor: activeTab === "photos" ? "rgba(255, 255, 255, 0.12)" : "var(--color-surface)",
                color: activeTab === "photos" ? "var(--color-secondary)" : "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="image" size={14} />
              <span>{t("mediaGallery")} ({uniquePhotos.length})</span>
            </button>
          )}

          {hasVideo && (
            <button
              role="tab"
              aria-selected={activeTab === "video"}
              onClick={() => setActiveTab("video")}
              className={`media-tab-btn ${activeTab === "video" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                borderColor: activeTab === "video" ? "var(--color-secondary)" : "var(--color-border-subtle)",
                backgroundColor: activeTab === "video" ? "rgba(255, 255, 255, 0.12)" : "var(--color-surface)",
                color: activeTab === "video" ? "var(--color-secondary)" : "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="video" size={14} />
              <span>{t("mediaVideo")}</span>
            </button>
          )}

          {has360 && (
            <button
              role="tab"
              aria-selected={activeTab === "360"}
              onClick={() => setActiveTab("360")}
              className={`media-tab-btn ${activeTab === "360" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                borderColor: activeTab === "360" ? "var(--color-secondary)" : "var(--color-border-subtle)",
                backgroundColor: activeTab === "360" ? "rgba(255, 255, 255, 0.12)" : "var(--color-surface)",
                color: activeTab === "360" ? "var(--color-secondary)" : "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="refresh-cw" size={14} />
              <span>{t("media360")}</span>
            </button>
          )}

          {has3D && (
            <button
              role="tab"
              aria-selected={activeTab === "3d"}
              onClick={() => setActiveTab("3d")}
              className={`media-tab-btn ${activeTab === "3d" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                borderColor: activeTab === "3d" ? "var(--color-secondary)" : "var(--color-border-subtle)",
                backgroundColor: activeTab === "3d" ? "rgba(255, 255, 255, 0.12)" : "var(--color-surface)",
                color: activeTab === "3d" ? "var(--color-secondary)" : "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <Icon name="box" size={14} />
              <span>{t("media3d")}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Viewport Container */}
      <div
        className="primary-media-viewport"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "#07080a",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-subtle)",
          overflow: "hidden",
          boxShadow: "var(--shadow-elevation-2)",
        }}
      >
        {/* TAB: PHOTOS */}
        {activeTab === "photos" && hasPhotos && (
          <div
            style={{ width: "100%", height: "100%", position: "relative" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={currentPhotoSrc}
              src={currentPhotoSrc}
              alt={`${vehicleAlt} — Ansicht ${activePhotoIdx + 1}`}
              loading={activePhotoIdx === 0 ? "eager" : "lazy"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: "zoom-in",
                transition: isReducedMotion() ? "none" : "opacity var(--duration-fast) var(--ease-smooth)",
              }}
              onClick={() => setIsLightboxOpen(true)}
            />

            {/* Subtle Floor Ambient Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(9, 10, 12, 0.6) 0%, transparent 40%)",
                pointerEvents: "none",
              }}
            />

            {/* Navigation Overlay Controls (Shown if more than 1 photo) */}
            {uniquePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t("lightboxPrev")}
                  onClick={handlePrevPhoto}
                  style={{
                    position: "absolute",
                    left: "var(--space-md)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "rgba(9, 10, 12, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 5,
                    transition: "all var(--duration-fast) var(--ease-smooth)",
                  }}
                >
                  <Icon name="chevron-left" size={22} />
                </button>

                <button
                  type="button"
                  aria-label={t("lightboxNext")}
                  onClick={handleNextPhoto}
                  style={{
                    position: "absolute",
                    right: "var(--space-md)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "rgba(9, 10, 12, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 5,
                    transition: "all var(--duration-fast) var(--ease-smooth)",
                  }}
                >
                  <Icon name="chevron-right" size={22} />
                </button>
              </>
            )}

            {/* Bottom Meta Bar: Photo Counter & Fullscreen Trigger */}
            <div
              style={{
                position: "absolute",
                bottom: "var(--space-md)",
                left: "var(--space-md)",
                right: "var(--space-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 6,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2xs)",
                  padding: "var(--space-2xs) var(--space-sm)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(9, 10, 12, 0.75)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <Icon name="image" size={13} color="var(--color-secondary)" />
                <span>
                  {activePhotoIdx + 1} / {uniquePhotos.length}
                </span>
              </div>

              <button
                type="button"
                aria-label={t("openFullscreen")}
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  pointerEvents: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2xs)",
                  padding: "var(--space-2xs) var(--space-sm)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(9, 10, 12, 0.75)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text)",
                  cursor: "pointer",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <Icon name="maximize" size={14} />
                <span className="hide-on-mobile">{t("openFullscreen")}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: VIDEO */}
        {activeTab === "video" && hasVideo && (
          <div style={{ width: "100%", height: "100%" }}>
            <VideoMedia
              src={media.video}
              poster={uniquePhotos[0] || media.thumbnail}
              aspectRatio="16-9"
              autoPlay={false}
              loop={true}
              muted={false}
            />
          </div>
        )}

        {/* TAB: 360 DEGREE INTERACTIVE */}
        {activeTab === "360" && has360 && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              cursor: "ew-resize",
              userSelect: "none",
            }}
            onMouseDown={handle360MouseDown}
            onMouseMove={handle360MouseMove}
            onMouseUp={handle360MouseUp}
            onMouseLeave={handle360MouseUp}
            onTouchStart={handle360MouseDown}
            onTouchMove={handle360MouseMove}
            onTouchEnd={handle360MouseUp}
          >
            <img
              src={images360[frame360Idx]}
              alt={`${vehicleAlt} — 360° Ansicht Frame ${frame360Idx + 1}`}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
              }}
            />

            {/* Interactive hint overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "var(--space-md)",
                left: "50%",
                transform: "translateX(-50%)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(9, 10, 12, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--color-border-subtle)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-secondary)",
                pointerEvents: "none",
              }}
            >
              <Icon name="refresh-cw" size={14} />
              <span>{t("view360Drag")}</span>
            </div>
          </div>
        )}

        {/* TAB: 3D MODEL */}
        {activeTab === "3d" && has3D && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              gap: "var(--space-sm)",
              padding: "var(--space-xl)",
              textAlign: "center",
            }}
          >
            <Icon name="box" size={48} color="var(--color-secondary)" />
            <h4 style={{ margin: 0, color: "var(--color-text)" }}>{t("media3d")}</h4>
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)", maxWidth: "420px" }}>
              {t("view3dExplore")}
            </p>
            {typeof media.model_3d === "string" && media.model_3d.startsWith("http") && (
              <iframe
                src={media.model_3d}
                title="3D Model Viewer"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (only for photos tab when more than 1 image exists) */}
      {activeTab === "photos" && uniquePhotos.length > 1 && (
        <div
          className="thumbnail-strip"
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(84px, 110px)",
            gap: "var(--space-xs)",
            marginTop: "var(--space-sm)",
            overflowX: "auto",
            paddingBottom: "var(--space-2xs)",
            scrollbarWidth: "thin",
          }}
        >
          {uniquePhotos.map((photo, idx) => {
            const isActive = idx === activePhotoIdx;
            return (
              <button
                key={photo + idx}
                type="button"
                aria-label={`Bild ${idx + 1} auswählen`}
                onClick={() => setActivePhotoIdx(idx)}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  padding: 0,
                  borderRadius: "var(--radius-sm)",
                  border: "2px solid",
                  borderColor: isActive ? "var(--color-secondary)" : "var(--color-border-subtle)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface)",
                  opacity: isActive ? 1 : 0.65,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("openFullscreen")}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(5, 6, 8, 0.96)",
            backdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-md) var(--space-xl)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text)" }}>
                {vehicleAlt}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-secondary)",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {activePhotoIdx + 1} / {uniquePhotos.length}
              </span>
            </div>

            <IconButton
              icon="x"
              ariaLabel={t("lightboxClose")}
              variant="secondary"
              size="md"
              onClick={() => setIsLightboxOpen(false)}
            />
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-md)",
              overflow: "hidden",
            }}
          >
            {uniquePhotos.length > 1 && (
              <button
                type="button"
                aria-label={t("lightboxPrev")}
                onClick={handlePrevPhoto}
                style={{
                  position: "absolute",
                  left: "var(--space-lg)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <Icon name="chevron-left" size={26} />
              </button>
            )}

            <img
              src={uniquePhotos[activePhotoIdx]}
              alt={`${vehicleAlt} — Vollbild ${activePhotoIdx + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                userSelect: "none",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
              }}
            />

            {uniquePhotos.length > 1 && (
              <button
                type="button"
                aria-label={t("lightboxNext")}
                onClick={handleNextPhoto}
                style={{
                  position: "absolute",
                  right: "var(--space-lg)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <Icon name="chevron-right" size={26} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarMediaGallery;
