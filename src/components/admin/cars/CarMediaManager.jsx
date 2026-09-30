import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";
import carsService from "../../../services/cars/cars.service";

export function CarMediaManager({ media = {}, onChange }) {
  const { t } = useTranslation(["admin", "cars", "common"]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const gallery = Array.isArray(media.gallery) ? media.gallery : [];
  const thumbnail = media.thumbnail || gallery[0] || "";

  const updateMedia = (key, val) => {
    onChange?.({
      ...media,
      [key]: val,
    });
  };

  const processFiles = async (filesList) => {
    const rawFiles = Array.from(filesList || []);
    if (rawFiles.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"];
    const validFiles = rawFiles.filter((f) => allowedTypes.includes(f.type));

    if (validFiles.length === 0) {
      setMediaError("Nur Bilddateien (JPG, PNG, WEBP, AVIF) sind erlaubt.");
      return;
    }

    const availableSlots = 20 - gallery.length;
    if (availableSlots <= 0) {
      setMediaError("Maximal 20 Galeriebilder erlaubt.");
      return;
    }

    const filesToUpload = validFiles.slice(0, availableSlots);
    setIsUploading(true);
    setMediaError(null);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      const res = await carsService.adminUploadMedia(formData);
      const uploadedUrls = res?.data?.urls || res?.urls || res?.data?.data?.urls || (Array.isArray(res) ? res : []);

      if (uploadedUrls.length > 0) {
        const nextGallery = [...gallery, ...uploadedUrls].slice(0, 20);
        const nextThumbnail = thumbnail || nextGallery[0] || "";
        onChange?.({
          ...media,
          gallery: nextGallery,
          thumbnail: nextThumbnail,
        });
        return;
      }
      throw new Error("No URLs returned");
    } catch (err) {
      console.warn("[CarMediaManager] Upload endpoint failed, using base64 fallback:", err);
      try {
        const dataUrls = await Promise.all(
          filesToUpload.map(
            (file) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          )
        );
        const nextGallery = [...gallery, ...dataUrls].slice(0, 20);
        const nextThumbnail = thumbnail || nextGallery[0] || "";
        onChange?.({
          ...media,
          gallery: nextGallery,
          thumbnail: nextThumbnail,
        });
      } catch (readErr) {
        setMediaError("Fehler beim Verarbeiten der Bilddateien.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const removedUrl = gallery[index];
    const nextGallery = gallery.filter((_, idx) => idx !== index);
    let nextThumbnail = thumbnail;
    if (thumbnail === removedUrl) {
      nextThumbnail = nextGallery[0] || "";
    }
    onChange?.({
      ...media,
      gallery: nextGallery,
      thumbnail: nextThumbnail,
    });
  };

  const handleMoveGalleryImage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const nextGallery = [...gallery];
    const temp = nextGallery[index];
    nextGallery[index] = nextGallery[targetIdx];
    nextGallery[targetIdx] = temp;
    updateMedia("gallery", nextGallery);
  };

  const handleSetAsThumbnail = (url) => {
    updateMedia("thumbnail", url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* ── 1. Cover Image Spotlight ────────────────────────────────────────── */}
      {thumbnail && (
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            padding: "12px 16px",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "var(--radius-md, 8px)",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "70px",
              borderRadius: "6px",
              overflow: "hidden",
              border: "2px solid #D4AF37",
              flexShrink: 0,
              backgroundColor: "#000",
            }}
          >
            <img src={thumbnail} alt="Cover Vorschau" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <Badge variant="primary" size="sm" style={{ backgroundColor: "#D4AF37", color: "#000000", fontWeight: 800 }}>
              ⭐ Aktuelles Coverbild
            </Badge>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--color-admin-muted)" }}>
              Dieses Bild wird als Hauptdarstellung in Listen und auf Fahrzeugkarten verwendet.
            </p>
          </div>
        </div>
      )}

      {/* ── 2. Device Image Upload Area ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-text)" }}>
            Fahrzeugbilder ({gallery.length} von max. 20)
          </label>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)", marginLeft: "8px" }}>
            Mindestens 1 Bild erforderlich
          </span>
        </div>

        {gallery.length < 20 && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Icon name="upload" size={14} style={{ marginRight: "6px" }} />
            Bilder vom Gerät hochladen
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={(e) => {
          processFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Drag & Drop Area */}
      {gallery.length < 20 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.length) {
              processFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? "2px dashed #D4AF37" : "2px dashed rgba(255, 255, 255, 0.2)",
            borderRadius: "var(--radius-lg, 12px)",
            padding: "24px 16px",
            textAlign: "center",
            backgroundColor: isDragOver ? "rgba(212, 175, 55, 0.08)" : "rgba(255, 255, 255, 0.02)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Icon name="upload" size={24} style={{ color: "#D4AF37" }} />
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
              Bilder hierher ziehen oder durchsuchen
            </span>
            <span style={{ display: "block", fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
              JPG, PNG, WEBP oder AVIF direkt von Ihrem Gerät hochladen (max. 20 Bilder)
            </span>
          </div>
        </div>
      )}

      {/* Progress & Error indicators */}
      {isUploading && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "6px",
            color: "#D4AF37",
            fontSize: "12px",
          }}
        >
          Bilder werden hochgeladen... Bitte warten.
        </div>
      )}

      {mediaError && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "6px",
            color: "#f87171",
            fontSize: "12px",
          }}
        >
          {mediaError}
        </div>
      )}

      {/* ── 3. Gallery Grid ─────────────────────────────────────────────────── */}
      {gallery.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "var(--space-sm)",
            maxHeight: "360px",
            overflowY: "auto",
            padding: "4px",
          }}
        >
          {gallery.map((url, idx) => {
            const isCover = url === thumbnail;

            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: isCover ? "2px solid #D4AF37" : "1px solid rgba(255, 255, 255, 0.12)",
                  backgroundColor: "#0d0e11",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: "95px", position: "relative" }}>
                  <img src={url} alt={`Bild ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {isCover && (
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        left: "4px",
                        backgroundColor: "#D4AF37",
                        color: "#000000",
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      ⭐ Cover
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "6px 8px",
                    backgroundColor: "rgba(18, 20, 24, 0.95)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={() => handleSetAsThumbnail(url)}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        backgroundColor: "rgba(212, 175, 55, 0.15)",
                        color: "#D4AF37",
                        border: "1px solid rgba(212, 175, 55, 0.35)",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Als Cover setzen
                    </button>
                  ) : (
                    <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#D4AF37", padding: "4px 0" }}>
                      Hauptbild
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveGalleryImage(idx, -1)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ffffff",
                          cursor: idx === 0 ? "default" : "pointer",
                          opacity: idx === 0 ? 0.2 : 0.8,
                          padding: "2px 4px",
                          fontSize: "12px",
                        }}
                        title="Nach links verschieben"
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        disabled={idx === gallery.length - 1}
                        onClick={() => handleMoveGalleryImage(idx, 1)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ffffff",
                          cursor: idx === gallery.length - 1 ? "default" : "pointer",
                          opacity: idx === gallery.length - 1 ? 0.2 : 0.8,
                          padding: "2px 4px",
                          fontSize: "12px",
                        }}
                        title="Nach rechts verschieben"
                      >
                        &rarr;
                      </button>
                    </div>

                    <span style={{ fontSize: "10px", color: "var(--color-admin-muted)" }}>#{idx + 1}</span>

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Bild entfernen"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "var(--space-xl)",
            textAlign: "center",
            border: "1px dashed var(--color-admin-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "var(--radius-md)",
            color: "var(--color-admin-muted)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          Noch keine Bilder hochgeladen. Klicken Sie oben auf "Bilder vom Gerät hochladen".
        </div>
      )}
    </div>
  );
}

export default CarMediaManager;
