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
  const [driveDirection, setDriveDirection] = useState("right");

  // 360 scrubber state
  const [frame360Idx, setFrame360Idx] = useState(0);
  const isDragging360 = useRef(false);
  const startX360 = useRef(0);

  // Touch swipe support for photos
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handlePrevPhoto = useCallback(() => {
    setDriveDirection("left");
    setActivePhotoIdx((prev) => (prev === 0 ? uniquePhotos.length - 1 : prev - 1));
  }, [uniquePhotos.length]);

  const handleNextPhoto = useCallback(() => {
    setDriveDirection("right");
    setActivePhotoIdx((prev) => (prev === uniquePhotos.length - 1 ? 0 : prev + 1));
  }, [uniquePhotos.length]);

  const handleSelectPhoto = useCallback((idx) => {
    setActivePhotoIdx((prev) => {
      if (idx > prev) setDriveDirection("right");
      else if (idx < prev) setDriveDirection("left");
      return idx;
    });
  }, []);

  // Thumbnail strip synchronization with gallery navigation & highway bar
  const thumbnailStripRef = useRef(null);
  const thumbnailRefs = useRef([]);

  // Highway line & car touch/pointer scrubbing logic
  const [isScrubbing, setIsScrubbing] = useState(false);
  const highwayTrackRef = useRef(null);
  const isPointerDownRef = useRef(false);

  // Auto-scroll thumbnail strip whenever active photo changes (via arrows, keyboard, click, or bar)
  useEffect(() => {
    if (thumbnailRefs.current[activePhotoIdx]) {
      thumbnailRefs.current[activePhotoIdx].scrollIntoView({
        behavior: isScrubbing ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    } else if (thumbnailStripRef.current && uniquePhotos.length > 1) {
      const maxScroll = thumbnailStripRef.current.scrollWidth - thumbnailStripRef.current.clientWidth;
      if (maxScroll > 0) {
        const targetScroll = (activePhotoIdx / (uniquePhotos.length - 1)) * maxScroll;
        thumbnailStripRef.current.scrollTo({
          left: targetScroll,
          behavior: isScrubbing ? "auto" : "smooth",
        });
      }
    }
  }, [activePhotoIdx, uniquePhotos.length, isScrubbing]);

  const updateScrub = useCallback((clientX) => {
    if (!highwayTrackRef.current || uniquePhotos.length <= 1) return;
    const rect = highwayTrackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clickX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIdx = Math.round(pct * (uniquePhotos.length - 1));
    handleSelectPhoto(targetIdx);

    // Synchronize thumbnail strip in real time while moving the bar
    if (thumbnailStripRef.current) {
      const maxScroll = thumbnailStripRef.current.scrollWidth - thumbnailStripRef.current.clientWidth;
      if (maxScroll > 0) {
        thumbnailStripRef.current.scrollLeft = pct * maxScroll;
      }
    }
  }, [uniquePhotos.length, handleSelectPhoto]);

  const handlePointerDown = (e) => {
    isPointerDownRef.current = true;
    setIsScrubbing(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateScrub(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return;
    updateScrub(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsScrubbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Touch fallback for touch devices
  const handleTouchScrub = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    updateScrub(e.touches[0].clientX);
  };

  // Keyboard navigation for active anytime anywhere
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (activeTab !== "photos") return;
      if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handlePrevPhoto, handleNextPhoto]);

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
                cursor: "default",
                transition: isReducedMotion() ? "none" : "opacity var(--duration-fast) var(--ease-smooth)",
              }}
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

            {/* Navigation Overlay Controls (Always active anytime anywhere) */}
            {uniquePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t("lightboxPrev", "Vorheriges Bild")}
                  onClick={handlePrevPhoto}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(12, 14, 18, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1.5px solid rgba(212, 175, 55, 0.4)",
                    color: "#D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 20,
                    pointerEvents: "auto",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(12, 14, 18, 0.85)";
                    e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  <Icon name="chevron-left" size={22} />
                </button>

                <button
                  type="button"
                  aria-label={t("lightboxNext", "Nächstes Bild")}
                  onClick={handleNextPhoto}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(12, 14, 18, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1.5px solid rgba(212, 175, 55, 0.4)",
                    color: "#D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 20,
                    pointerEvents: "auto",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(12, 14, 18, 0.85)";
                    e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  <Icon name="chevron-right" size={22} />
                </button>
              </>
            )}

            {/* Bottom Meta Bar: Photo Counter (No Fullscreen button) */}
            <div
              style={{
                position: "absolute",
                bottom: "var(--space-md)",
                left: "var(--space-md)",
                display: "flex",
                alignItems: "center",
                zIndex: 6,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2xs)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(9, 10, 12, 0.75)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: "#D4AF37",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <Icon name="image" size={13} color="#D4AF37" />
                <span>
                  {activePhotoIdx + 1} / {uniquePhotos.length}
                </span>
              </div>
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

      {/* ─── 1. Gallery View / Thumbnail Strip (ABOVE the gold line) ─── */}
      {activeTab === "photos" && uniquePhotos.length > 1 && (
        <div
          ref={thumbnailStripRef}
          className="thumbnail-strip"
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(84px, 110px)",
            gap: "var(--space-xs)",
            marginTop: "12px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          {uniquePhotos.map((photo, idx) => {
            const isActive = idx === activePhotoIdx;
            return (
              <button
                key={photo + idx}
                ref={(el) => (thumbnailRefs.current[idx] = el)}
                type="button"
                aria-label={`Bild ${idx + 1} auswählen`}
                onClick={() => handleSelectPhoto(idx)}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  padding: 0,
                  borderRadius: "var(--radius-sm)",
                  border: "2px solid",
                  borderColor: isActive ? "#D4AF37" : "var(--color-border-subtle)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface)",
                  opacity: isActive ? 1 : 0.65,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  boxShadow: isActive ? "0 0 10px rgba(212, 175, 55, 0.4)" : "none",
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

      {/* ─── 2. Interactive Gold Highway Track with Touch & Drag Driving Car (BELOW gallery view) ─── */}
      {activeTab === "photos" && uniquePhotos.length > 1 && (
        <div
          className="gallery-highway-track"
          style={{
            marginTop: "10px",
            marginBottom: "6px",
            padding: "8px 14px",
            borderRadius: "14px",
            backgroundColor: "rgba(12, 14, 18, 0.85)",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.5)",
            userSelect: "none",
          }}
        >
          {/* Active Image Counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#D4AF37",
              fontSize: "13px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              minWidth: "70px",
              userSelect: "none",
            }}
          >
            <Icon name="image" size={15} color="#D4AF37" />
            <span>
              {String(activePhotoIdx + 1).padStart(2, "0")} / {String(uniquePhotos.length).padStart(2, "0")}
            </span>
          </div>

          {/* Interactive Golden Highway Track - Touch & Drag Enabled */}
          <div
            ref={highwayTrackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchScrub}
            onTouchMove={handleTouchScrub}
            style={{
              position: "relative",
              flex: 1,
              height: "30px",
              display: "flex",
              alignItems: "center",
              cursor: isScrubbing ? "grabbing" : "pointer",
              touchAction: "none",
              padding: "0 4px",
            }}
            title="Berühren oder ziehen, um das Auto zu steuern"
          >
            {/* Dark Groove Track - No White Lines! */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.9)",
              }}
            >
              {/* Active Gold Road Line - The Only Highlight Line */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${uniquePhotos.length > 1 ? (activePhotoIdx / (uniquePhotos.length - 1)) * 100 : 100}%`,
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #996515 0%, #D4AF37 70%, #F5DEB3 100%)",
                  boxShadow: "0 0 12px rgba(212, 175, 55, 0.75)",
                  transition: isScrubbing ? "none" : "width 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              />

              {/* Small Car Icon - Touch & Drag Capable */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${uniquePhotos.length > 1 ? (activePhotoIdx / (uniquePhotos.length - 1)) * 100 : 100}%`,
                  transform: `translate(-50%, -75%) ${driveDirection === "left" ? "scaleX(-1)" : "scaleX(1)"}`,
                  transition: isScrubbing ? "none" : "left 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease",
                  cursor: isScrubbing ? "grabbing" : "grab",
                  touchAction: "none",
                  zIndex: 10,
                  padding: "4px",
                  filter: "drop-shadow(0 3px 8px rgba(212, 175, 55, 0.85))",
                }}
              >
                <svg width="28" height="16" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 9.5H3.5C3.8 8.1 5 7 6.5 7C8 7 9.2 8.1 9.5 9.5H14.5C14.8 8.1 16 7 17.5 7C19 7 20.2 8.1 20.5 9.5H22.5C23.1 9.5 23.5 9.1 23.5 8.5V6.8C23.5 6.1 23.1 5.5 22.5 5.2L18.8 3.5C18.2 3.2 17.5 3 16.8 3H10.5C9.6 3 8.7 3.4 8.2 4.1L5.8 7H3C1.9 7 1 7.9 1 9V9.5H1.5Z" fill="#D4AF37"/>
                  <path d="M9 4.5H10.5C11 4.5 11.5 4.7 11.8 5L13.5 6.8H8L9 4.5Z" fill="#0d0e11"/>
                  <path d="M14.5 6.8L13 4.8C13.2 4.6 13.5 4.5 13.8 4.5H16.5L18.5 6.8H14.5Z" fill="#0d0e11"/>
                  <circle cx="6.5" cy="9.5" r="2.5" fill="#181a20" stroke="#D4AF37" strokeWidth="1.2"/>
                  <circle cx="6.5" cy="9.5" r="1" fill="#D4AF37"/>
                  <circle cx="17.5" cy="9.5" r="2.5" fill="#181a20" stroke="#D4AF37" strokeWidth="1.2"/>
                  <circle cx="17.5" cy="9.5" r="1" fill="#D4AF37"/>
                  <circle cx="22.5" cy="6.5" r="1" fill="#FFE082"/>
                  <circle cx="1.5" cy="8" r="0.8" fill="#FF5252"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                e.currentTarget.style.borderColor = "#D4AF37";
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next photo"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                e.currentTarget.style.borderColor = "#D4AF37";
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .thumbnail-strip::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
}

export default CarMediaGallery;
