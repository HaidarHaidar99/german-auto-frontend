import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import VideoMedia from "../media/VideoMedia";
import { isReducedMotion } from "../../utils/animation";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * German Auto — CarMediaGallery Component
 * Cinematic primary media stage, thumbnail navigation, video, 360° interactive viewer,
 * 3D model container, and fullscreen lightbox modal with keyboard and touch support.
 */
export function CarMediaGallery({ car, className = "", style = {} }) {
  const { t } = useTranslation(["cars", "common"]);
  const { isDark } = useTheme?.() || { isDark: true };

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

  // Gallery container ref to isolate scrolling and keep page completely still
  const galleryRef = useRef(null);

  // Prevent horizontal scroll gestures from moving or shifting the outer page
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      // If user scrolls horizontally on trackpad or mouse, consume it so the page never moves
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handlePrevPhoto = useCallback(() => {
    setActivePhotoIdx((prev) => {
      if (prev <= 0) return 0; // Stop cleanly at first image
      setDriveDirection("left");
      return prev - 1;
    });
  }, []);

  const handleNextPhoto = useCallback(() => {
    setActivePhotoIdx((prev) => {
      if (prev >= uniquePhotos.length - 1) return prev; // Stop cleanly at last image
      setDriveDirection("right");
      return prev + 1;
    });
  }, [uniquePhotos.length]);

  // Touch swipe support on the large car image
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const touchDeltaY = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isVerticalScroll = useRef(false);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length !== 1 || isVerticalScroll.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;
    touchDeltaX.current = diffX;
    touchDeltaY.current = diffY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // Identify direction intent early (threshold of 8px)
    if (!isHorizontalSwipe.current && !isVerticalScroll.current) {
      if (absY > 8 && absY > absX) {
        // Vertical gesture -> let the page scroll naturally
        isVerticalScroll.current = true;
        return;
      }
      if (absX > 8 && absX >= absY) {
        // Horizontal gesture -> gallery swipe
        isHorizontalSwipe.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    if (isVerticalScroll.current) {
      isVerticalScroll.current = false;
      isHorizontalSwipe.current = false;
      return;
    }

    const absX = Math.abs(touchDeltaX.current);
    const absY = Math.abs(touchDeltaY.current);

    // Natural, reliable swipe threshold: 35px horizontal movement
    if (absX >= 35 && absX > absY * 1.2) {
      if (touchDeltaX.current < 0) {
        // Swipe LEFT -> next image
        handleNextPhoto();
      } else {
        // Swipe RIGHT -> previous image
        handlePrevPhoto();
      }
    }

    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;
  };

  const handleTouchCancel = () => {
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;
  };

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

  // Auto-scroll thumbnail strip smoothly isolated within container (NEVER shifts the page or window)
  useEffect(() => {
    const strip = thumbnailStripRef.current;
    const thumb = thumbnailRefs.current[activePhotoIdx];
    if (strip && thumb) {
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.offsetWidth;
      const stripWidth = strip.clientWidth;
      const targetScroll = thumbLeft - (stripWidth / 2) + (thumbWidth / 2);
      strip.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: isScrubbing ? "auto" : "smooth",
      });
    } else if (strip && uniquePhotos.length > 1) {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      if (maxScroll > 0) {
        const targetScroll = (activePhotoIdx / (uniquePhotos.length - 1)) * maxScroll;
        strip.scrollTo({
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
    <div
      ref={galleryRef}
      className={`car-media-gallery ${className}`.trim()}
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        overscrollBehaviorX: "none",
        touchAction: "pan-y",
        ...style,
      }}
    >
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

      {/* ─── Main Viewport & Outer Arrow Stage Wrapper ─── */}
      <div className="gallery-stage-wrapper" style={{ position: "relative", width: "100%" }}>
        {/* Main Viewport Container */}
        <div
          className="primary-media-viewport"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#07080a",
            borderRadius: "16px",
            border: isDark ? "2px solid rgba(212, 175, 55, 0.8)" : "2px solid rgba(212, 175, 55, 0.85)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.25)"
              : "none",
            overflow: "hidden",
            touchAction: "pan-y",
            overscrollBehaviorX: "none",
            userSelect: "none",
          }}
        >
          {/* TAB: PHOTOS */}
          {activeTab === "photos" && hasPhotos && (
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                touchAction: "pan-y",
                overscrollBehaviorX: "none",
                overflow: "hidden",
              }}
            >
              <img
                key={currentPhotoSrc}
                src={currentPhotoSrc}
                alt={`${vehicleAlt} — Ansicht ${activePhotoIdx + 1}`}
                loading={activePhotoIdx === 0 ? "eager" : "lazy"}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  cursor: "default",
                  userSelect: "none",
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

      {/* Outer Navigation Arrows (Outside on Desktop, Transparent on Mobile) */}
      {activeTab === "photos" && uniquePhotos.length > 1 && (
        <>
          {/* Left Arrow: Only appears if there is a photo before */}
          {activePhotoIdx > 0 && (
            <button
              type="button"
              className="gallery-nav-arrow gallery-nav-prev"
              aria-label={t("lightboxPrev", "Vorheriges Bild")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevPhoto();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDark ? "#2d3748" : "#e5e7eb",
                color: isDark ? "#ffffff" : "#000000",
              }}
            >
              <Icon name="chevron-left" size={18} style={{ pointerEvents: "none" }} />
            </button>
          )}

          {/* Right Arrow: Only appears if there is a photo after */}
          {activePhotoIdx < uniquePhotos.length - 1 && (
            <button
              type="button"
              className="gallery-nav-arrow gallery-nav-next"
              aria-label={t("lightboxNext", "Nächstes Bild")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextPhoto();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDark ? "#2d3748" : "#e5e7eb",
                color: isDark ? "#ffffff" : "#000000",
              }}
            >
              <Icon name="chevron-right" size={18} style={{ pointerEvents: "none" }} />
            </button>
          )}
        </>
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
            overscrollBehaviorX: "contain",
            touchAction: "pan-x pan-y",
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
                  borderRadius: "10px",
                  border: isActive ? "2.5px solid #D4AF37" : "1.5px solid var(--color-border-subtle)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface)",
                  opacity: isActive ? 1 : 0.65,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  boxShadow: (isActive && isDark) ? "0 0 12px rgba(212, 175, 55, 0.55)" : "none",
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
            backgroundColor: isDark ? "rgba(12, 14, 18, 0.85)" : "#ffffff",
            border: isDark ? "1px solid rgba(212, 175, 55, 0.25)" : "1px solid rgba(212, 175, 55, 0.4)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: isDark ? "0 4px 18px rgba(0, 0, 0, 0.5)" : "none",
            userSelect: "none",
          }}
        >
          {/* Active Image Counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: isDark ? "#D4AF37" : "#B8860B",
              fontSize: "13px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              minWidth: "70px",
              userSelect: "none",
            }}
          >
            <Icon name="image" size={15} color={isDark ? "#D4AF37" : "#B8860B"} />
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
            {/* Groove Track */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.08)",
                border: isDark ? "1px solid rgba(212, 175, 55, 0.2)" : "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: isDark ? "inset 0 1px 3px rgba(0, 0, 0, 0.9)" : "inset 0 1px 2px rgba(0, 0, 0, 0.08)",
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
                  boxShadow: isDark ? "0 0 12px rgba(212, 175, 55, 0.75)" : "none",
                  transition: isScrubbing ? "none" : "width 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              />

              {/* Finish Line Checkered Marker at the end of the track */}
              <div
                style={{
                  position: "absolute",
                  right: "-4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
                title="Ziel / Finish Line"
              >
                <svg width="15" height="18" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="2" y1="1" x2="2" y2="19" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                  <rect x="2" y="2" width="12" height="10" rx="1" fill={isDark ? "#181a20" : "#ffffff"} stroke="#D4AF37" strokeWidth="0.8" />
                  <rect x="2" y="2" width="3" height="5" fill="#D4AF37" />
                  <rect x="8" y="2" width="3" height="5" fill="#D4AF37" />
                  <rect x="5" y="7" width="3" height="5" fill="#D4AF37" />
                  <rect x="11" y="7" width="3" height="5" fill="#D4AF37" />
                </svg>
              </div>

              {/* Small Car Icon - Touch & Drag Capable (Faces forward towards finish line) */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${uniquePhotos.length > 1 ? (activePhotoIdx / (uniquePhotos.length - 1)) * 100 : 100}%`,
                  transform: `translate(-50%, -75%) ${driveDirection === "left" ? "scaleX(1)" : "scaleX(-1)"}`,
                  transition: isScrubbing ? "none" : "left 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease",
                  cursor: isScrubbing ? "grabbing" : "grab",
                  touchAction: "none",
                  zIndex: 10,
                  padding: "4px",
                  filter: isDark ? "drop-shadow(0 3px 8px rgba(212, 175, 55, 0.85))" : "none",
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
