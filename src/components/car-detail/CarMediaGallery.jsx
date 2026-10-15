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
export function CarMediaGallery({ car, onRefreshImages, className = "", style = {} }) {
  const { t } = useTranslation(["cars", "common"]);
  const { isDark } = useTheme?.() || { isDark: true };

  // Bounded retry counter for expired signed URLs
  const retryCountRef = useRef(0);
  const handleImageError = useCallback(async (idx) => {
    if (retryCountRef.current < 2 && onRefreshImages) {
      retryCountRef.current += 1;
      try {
        await onRefreshImages();
      } catch {}
    }
  }, [onRefreshImages]);

  // Reset retry counter whenever car images update
  useEffect(() => {
    retryCountRef.current = 0;
  }, [car?.images]);

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

  // 360 interactive viewer state
  const [frame360Idx, setFrame360Idx] = useState(0);
  const isDragging360 = useRef(false);
  const startX360 = useRef(0);

  // Fullscreen Zoom / Lightbox modal state across entire collection
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lightboxThumbStripRef = useRef(null);
  const lightboxThumbRefs = useRef([]);

  // Stage Pinch-to-Zoom (Touch min and max) & Panning State
  const [stageZoomScale, setStageZoomScale] = useState(1);
  const [stagePanOffset, setStagePanOffset] = useState({ x: 0, y: 0 });
  const isPinchingStage = useRef(false);
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);
  const isPanningStage = useRef(false);
  const stagePanStart = useRef({ x: 0, y: 0 });
  const lastStageTapTime = useRef(0);

  // Reset stage zoom on photo navigation
  useEffect(() => {
    setStageZoomScale(1);
    setStagePanOffset({ x: 0, y: 0 });
  }, [activePhotoIdx]);

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

  // ── Stage Touch Gestures: Pinch to Zoom (Min / Max) & Pan ──
  const handleStageTouchStart = (e) => {
    if (!e.touches) return;

    if (e.touches.length === 2) {
      isPinchingStage.current = true;
      isPanningStage.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchStartDist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartScale.current = stageZoomScale;
      return;
    }

    if (e.touches.length === 1) {
      if (stageZoomScale > 1.05) {
        isPanningStage.current = true;
        isPinchingStage.current = false;
        stagePanStart.current = {
          x: e.touches[0].clientX - stagePanOffset.x,
          y: e.touches[0].clientY - stagePanOffset.y,
        };
      } else {
        handleTouchStart(e);
      }
    }
  };

  const handleStageTouchMove = (e) => {
    if (!e.touches) return;

    if (e.touches.length === 2 && isPinchingStage.current) {
      if (e.cancelable) e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDist / (pinchStartDist.current || 1);
      const newScale = Math.min(3.5, Math.max(1, +(pinchStartScale.current * ratio).toFixed(2)));
      setStageZoomScale(newScale);
      if (newScale <= 1.02) {
        setStagePanOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (e.touches.length === 1 && isPanningStage.current && stageZoomScale > 1.05) {
      if (e.cancelable) e.preventDefault();
      const maxPanX = (stageZoomScale - 1) * 220;
      const maxPanY = (stageZoomScale - 1) * 140;
      const newX = e.touches[0].clientX - stagePanStart.current.x;
      const newY = e.touches[0].clientY - stagePanStart.current.y;
      setStagePanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
      });
      return;
    }

    if (stageZoomScale <= 1.05) {
      handleTouchMove(e);
    }
  };

  const handleStageTouchEnd = () => {
    if (isPinchingStage.current) {
      isPinchingStage.current = false;
      if (stageZoomScale <= 1.05) {
        setStageZoomScale(1);
        setStagePanOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (isPanningStage.current) {
      isPanningStage.current = false;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastStageTapTime.current;

    if (timeSinceLastTap < 300) {
      lastStageTapTime.current = 0;
      if (stageZoomScale > 1.05) {
        setStageZoomScale(1);
        setStagePanOffset({ x: 0, y: 0 });
      } else {
        setStageZoomScale(2.2);
      }
      return;
    }

    lastStageTapTime.current = now;

    if (stageZoomScale <= 1.05) {
      handleTouchEnd();
    }
  };

  const handleStageTouchCancel = () => {
    isPinchingStage.current = false;
    isPanningStage.current = false;
    handleTouchCancel();
  };

  const handleStageMouseDown = (e) => {
    if (stageZoomScale > 1.05) {
      isPanningStage.current = true;
      stagePanStart.current = {
        x: e.clientX - stagePanOffset.x,
        y: e.clientY - stagePanOffset.y,
      };
    }
  };

  const handleStageMouseMove = (e) => {
    if (!isPanningStage.current || stageZoomScale <= 1.05) return;
    const maxPanX = (stageZoomScale - 1) * 220;
    const maxPanY = (stageZoomScale - 1) * 140;
    const newX = e.clientX - stagePanStart.current.x;
    const newY = e.clientY - stagePanStart.current.y;
    setStagePanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    });
  };

  const handleStageMouseUp = () => {
    isPanningStage.current = false;
  };

  const handleStageDoubleClick = () => {
    if (stageZoomScale > 1.05) {
      setStageZoomScale(1);
      setStagePanOffset({ x: 0, y: 0 });
    } else {
      setStageZoomScale(2.2);
    }
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

  // Efficient lazy loading: Preload only nearby full-size images (active ± 1, active + 2)
  useEffect(() => {
    if (activeTab !== "photos" || uniquePhotos.length === 0) return;
    const nearbyIndices = [activePhotoIdx + 1, activePhotoIdx - 1, activePhotoIdx + 2].filter(
      (idx) => idx >= 0 && idx < uniquePhotos.length
    );
    nearbyIndices.forEach((idx) => {
      const src = uniquePhotos[idx];
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [activePhotoIdx, uniquePhotos, activeTab]);

  // Lock background page scroll when lightbox modal is open
  useEffect(() => {
    if (isZoomOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isZoomOpen]);

  // Auto-scroll lightbox thumbnail strip smoothly
  useEffect(() => {
    if (!isZoomOpen) return;
    const strip = lightboxThumbStripRef.current;
    const thumb = lightboxThumbRefs.current[activePhotoIdx];
    if (strip && thumb) {
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.offsetWidth;
      const stripWidth = strip.clientWidth;
      const targetScroll = thumbLeft - stripWidth / 2 + thumbWidth / 2;
      strip.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [activePhotoIdx, isZoomOpen]);

  // Zoom and Lightbox handlers
  const handleOpenZoom = useCallback((idx = activePhotoIdx) => {
    setActivePhotoIdx(idx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomOpen(true);
  }, [activePhotoIdx]);

  const handleCloseZoom = useCallback(() => {
    setIsZoomOpen(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleToggleZoom = useCallback((e) => {
    e?.stopPropagation?.();
    setZoomScale((prev) => {
      if (prev > 1) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  const handlePanStart = (clientX, clientY) => {
    if (zoomScale <= 1) return;
    isPanningRef.current = true;
    panStartRef.current = {
      x: clientX - panOffset.x,
      y: clientY - panOffset.y,
    };
  };

  const handlePanMove = (clientX, clientY) => {
    if (!isPanningRef.current || zoomScale <= 1) return;
    setPanOffset({
      x: clientX - panStartRef.current.x,
      y: clientY - panStartRef.current.y,
    });
  };

  const handlePanEnd = () => {
    isPanningRef.current = false;
  };

  const handleSelectPhotoInZoom = (idx) => {
    handleSelectPhoto(idx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation for active anytime anywhere and in lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (isZoomOpen) {
        if (e.key === "Escape") {
          handleCloseZoom();
          return;
        }
        if (e.key === "ArrowLeft") {
          handlePrevPhoto();
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
          return;
        }
        if (e.key === "ArrowRight") {
          handleNextPhoto();
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
          return;
        }
        if (e.key === "+" || e.key === "=") {
          handleZoomIn();
          return;
        }
        if (e.key === "-") {
          handleZoomOut();
          return;
        }
        if (e.key === "0") {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
          return;
        }
      }
      if (activeTab !== "photos") return;
      if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handlePrevPhoto, handleNextPhoto, isZoomOpen, handleCloseZoom, handleZoomIn, handleZoomOut]);



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
            backgroundColor: isDark ? "#07080a" : "var(--color-surface, #ffffff)",
            borderRadius: "16px",
            border: isDark ? "2px solid rgba(212, 175, 55, 0.8)" : "1px solid rgba(212, 175, 55, 0.5)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.25)"
              : "none",
            overflow: "hidden",
            touchAction: stageZoomScale > 1 ? "none" : "pan-y",
            overscrollBehaviorX: "none",
            userSelect: "none",
          }}
        >
          {/* TAB: PHOTOS */}
          {activeTab === "photos" && hasPhotos && (
            <div
              onTouchStart={handleStageTouchStart}
              onTouchMove={handleStageTouchMove}
              onTouchEnd={handleStageTouchEnd}
              onTouchCancel={handleStageTouchCancel}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onMouseLeave={handleStageMouseUp}
              onDoubleClick={handleStageDoubleClick}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                touchAction: stageZoomScale > 1 ? "none" : "pan-y",
                overscrollBehaviorX: "none",
                overflow: "hidden",
                cursor: stageZoomScale > 1 ? (isPanningStage.current ? "grabbing" : "grab") : "default",
              }}
            >
              <img
                key={currentPhotoSrc}
                src={currentPhotoSrc}
                alt={`${vehicleAlt} — Ansicht ${activePhotoIdx + 1}`}
                loading={activePhotoIdx === 0 ? "eager" : "lazy"}
                draggable={false}
                onError={() => handleImageError(activePhotoIdx)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  userSelect: "none",
                  transform: `translate(${stagePanOffset.x}px, ${stagePanOffset.y}px) scale(${stageZoomScale})`,
                  transformOrigin: "center center",
                  transition: isPinchingStage.current || isPanningStage.current ? "none" : "transform 0.24s cubic-bezier(0.2, 0, 0.2, 1)",
                  willChange: "transform",
                }}
              />

              {/* Floor Ambient Gradient: ONLY in dark mode, completely erased in light mode */}
              {isDark && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(9, 10, 12, 0.5) 0%, transparent 35%)",
                    pointerEvents: "none",
                  }}
                />
              )}
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
                  onError={() => handleImageError(idx)}
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

      {/* ─── 3. Fullscreen Zoom & Lightbox Modal across entire collection ─── */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vollbild-Galerie"
          onClick={handleCloseZoom}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(5, 6, 8, 0.96)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            userSelect: "none",
          }}
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(10, 12, 16, 0.8)",
              backdropFilter: "blur(12px)",
              flexShrink: 0,
            }}
          >
            {/* Vehicle Title & Count */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {car.brand} {car.model || car.title}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(212, 175, 55, 0.15)",
                  border: "1px solid rgba(212, 175, 55, 0.35)",
                  color: "#D4AF37",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                <Icon name="image" size={13} />
                <span>
                  {activePhotoIdx + 1} / {uniquePhotos.length}
                </span>
              </span>
            </div>

            {/* Close Button Only — Zero Zoom Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleCloseZoom}
                aria-label={t("lightboxClose", "Schließen")}
                title={t("lightboxClose", "Schließen (Esc)")}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(220, 38, 38, 0.2)",
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                  color: "#f87171",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.2)";
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: zoomScale > 1 ? (isPanningRef.current ? "grabbing" : "grab") : "default",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseZoom();
            }}
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0) handleZoomIn();
              else handleZoomOut();
            }}
            onPointerDown={(e) => {
              if (zoomScale > 1) {
                handlePanStart(e.clientX, e.clientY);
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {}
              }
            }}
            onPointerMove={(e) => {
              if (zoomScale > 1) {
                handlePanMove(e.clientX, e.clientY);
              }
            }}
            onPointerUp={(e) => {
              handlePanEnd();
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
            }}
            onTouchStart={(e) => {
              if (zoomScale > 1 && e.touches.length === 1) {
                handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
              } else {
                handleTouchStart(e);
              }
            }}
            onTouchMove={(e) => {
              if (zoomScale > 1 && e.touches.length === 1) {
                handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
              } else {
                handleTouchMove(e);
              }
            }}
            onTouchEnd={() => {
              if (zoomScale > 1) {
                handlePanEnd();
              } else {
                handleTouchEnd();
              }
            }}
          >
            {/* Full-size Image */}
            <img
              key={`lb-img-${currentPhotoSrc}`}
              src={currentPhotoSrc}
              alt={`${vehicleAlt} — Großansicht ${activePhotoIdx + 1}`}
              draggable={false}
              onDoubleClick={handleToggleZoom}
              onError={() => handleImageError(activePhotoIdx)}
              style={{
                maxWidth: "92vw",
                maxHeight: "72vh",
                objectFit: "contain",
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transformOrigin: "center center",
                transition: isPanningRef.current ? "none" : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
                borderRadius: "8px",
                pointerEvents: "auto",
              }}
            />

            {/* Left Nav Arrow */}
            {activePhotoIdx > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                aria-label={t("lightboxPrev", "Vorheriges Bild")}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(18, 20, 26, 0.85)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  color: "#D4AF37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  zIndex: 20,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(18, 20, 26, 0.85)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                }}
              >
                <Icon name="chevron-left" size={24} />
              </button>
            )}

            {/* Right Nav Arrow */}
            {activePhotoIdx < uniquePhotos.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                aria-label={t("lightboxNext", "Nächstes Bild")}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(18, 20, 26, 0.85)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  color: "#D4AF37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  zIndex: 20,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.25)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(18, 20, 26, 0.85)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                }}
              >
                <Icon name="chevron-right" size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip across full collection */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(10, 12, 16, 0.9)",
              backdropFilter: "blur(12px)",
              flexShrink: 0,
            }}
          >
            <div
              ref={lightboxThumbStripRef}
              style={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: "minmax(70px, 86px)",
                gap: "8px",
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                padding: "4px 0",
              }}
            >
              {uniquePhotos.map((photo, idx) => {
                const isActive = idx === activePhotoIdx;
                return (
                  <button
                    key={`lb-thumb-${photo}-${idx}`}
                    ref={(el) => (lightboxThumbRefs.current[idx] = el)}
                    type="button"
                    onClick={() => handleSelectPhotoInZoom(idx)}
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 10",
                      padding: 0,
                      borderRadius: "6px",
                      border: isActive ? "2px solid #D4AF37" : "1px solid rgba(255, 255, 255, 0.15)",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "#000",
                      opacity: isActive ? 1 : 0.55,
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.15s ease",
                      boxShadow: isActive ? "0 0 10px rgba(212, 175, 55, 0.5)" : "none",
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Miniatur ${idx + 1}`}
                      loading="lazy"
                      onError={() => handleImageError(idx)}
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
