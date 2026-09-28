import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../forms/Input";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

export function CarMediaManager({ media = {}, onChange }) {
  const { t } = useTranslation(["admin", "cars", "common"]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [mediaError, setMediaError] = useState(null);

  const gallery = Array.isArray(media.gallery) ? media.gallery : [];
  const thumbnail = media.thumbnail || "";
  const video = media.video || "";
  const model3d = media.model_3d || "";

  const updateMedia = (key, val) => {
    onChange?.({
      ...media,
      [key]: val,
    });
  };

  const handleAddGalleryImage = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;

    if (gallery.length >= 20) {
      setMediaError(t("maxGalleryImagesError", { defaultValue: "Maximal 20 Galeriebilder erlaubt." }));
      return;
    }

    setMediaError(null);
    updateMedia("gallery", [...gallery, url]);
    setNewGalleryUrl("");

    // If no cover thumbnail is set yet, auto-set the first gallery image as cover
    if (!thumbnail) {
      updateMedia("thumbnail", url);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const removedUrl = gallery[index];
    const nextGallery = gallery.filter((_, idx) => idx !== index);
    updateMedia("gallery", nextGallery);

    // If removed image was the thumbnail, update thumbnail to new first gallery image or empty
    if (thumbnail === removedUrl) {
      updateMedia("thumbnail", nextGallery[0] || "");
    }
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      {/* ── 1. Cover / Thumbnail Image ────────────────────────────────────── */}
      <div
        style={{
          padding: "var(--space-md)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-admin-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
          <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-text)" }}>
            {t("primaryCoverImage", { defaultValue: "Hauptbild / Cover-Thumbnail" })}
          </label>
          {thumbnail && (
            <Badge variant="success" size="sm">
              {t("coverActive", { defaultValue: "Aktiv" })}
            </Badge>
          )}
        </div>

        <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {thumbnail ? (
            <div
              style={{
                position: "relative",
                width: "140px",
                height: "90px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--color-secondary)",
                flexShrink: 0,
                backgroundColor: "var(--color-surface)",
              }}
            >
              <img
                src={thumbnail}
                alt="Cover Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => updateMedia("thumbnail", "")}
                title={t("removeCover", { defaultValue: "Cover entfernen" })}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "#ef4444",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ) : (
            <div
              style={{
                width: "140px",
                height: "90px",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--color-admin-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                color: "var(--color-admin-muted)",
                fontSize: "11px",
                flexShrink: 0,
              }}
            >
              <Icon name="image" size={24} />
              <span>{t("noCoverImage", { defaultValue: "Kein Coverbild" })}</span>
            </div>
          )}

          <div style={{ flex: 1, minWidth: "220px" }}>
            <Input
              value={thumbnail}
              onChange={(e) => updateMedia("thumbnail", e.target.value)}
              placeholder="https://.../cover.webp"
              style={{ height: "38px", fontSize: "var(--font-size-xs)" }}
            />
            <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)", marginTop: "4px", display: "block" }}>
              {t("coverImageHint", { defaultValue: "Wird als Hauptdarstellung in Listen und Showroom verwendet." })}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Gallery Images (up to 20) ─────────────────────────────────── */}
      <div
        style={{
          padding: "var(--space-md)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-admin-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
          <div>
            <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-text)" }}>
              {t("galleryImages", { defaultValue: "Galeriebilder" })}
            </label>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)", marginLeft: "8px" }}>
              ({gallery.length} / 20)
            </span>
          </div>

          {gallery.length >= 20 && (
            <Badge variant="warning" size="sm">
              {t("maxReached", { defaultValue: "Limit erreicht (20/20)" })}
            </Badge>
          )}
        </div>

        {/* Add Gallery URL Input */}
        <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-md)" }}>
          <div style={{ flex: 1 }}>
            <Input
              value={newGalleryUrl}
              onChange={(e) => {
                setNewGalleryUrl(e.target.value);
                setMediaError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGalleryImage();
                }
              }}
              placeholder="https://.../gallery-photo.webp"
              style={{ height: "36px", fontSize: "var(--font-size-xs)" }}
              disabled={gallery.length >= 20}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddGalleryImage}
            disabled={!newGalleryUrl.trim() || gallery.length >= 20}
            style={{ height: "36px" }}
          >
            <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
            {t("addImage", { defaultValue: "Hinzufügen" })}
          </Button>
        </div>

        {mediaError && (
          <div style={{ color: "#ef4444", fontSize: "var(--font-size-xs)", marginBottom: "var(--space-sm)" }}>
            {mediaError}
          </div>
        )}

        {/* Gallery Thumbnails Grid */}
        {gallery.length === 0 ? (
          <div
            style={{
              padding: "var(--space-lg)",
              textAlign: "center",
              border: "1px dashed var(--color-admin-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-muted)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            {t("noGalleryImages", { defaultValue: "Noch keine Bilder in der Galerie. Fügen Sie Bild-URLs oben hinzu." })}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "var(--space-sm)",
            }}
          >
            {gallery.map((url, idx) => {
              const isCover = thumbnail === url;

              return (
                <div
                  key={`${url}-${idx}`}
                  style={{
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: `1px solid ${isCover ? "var(--color-secondary)" : "var(--color-admin-border)"}`,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "90px" }}>
                    <img
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22140%22%20height%3D%2290%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23222%22%20width%3D%22140%22%20height%3D%2290%22%2F%3E%3Ctext%20fill%3D%22%23666%22%20font-size%3D%2211%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EBildfehler%3C%2Ftext%3E%3C%2Fsvg%3E";
                      }}
                    />

                    {isCover && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          left: "4px",
                          backgroundColor: "var(--color-secondary)",
                          color: "#000",
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 4px",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                        }}
                      >
                        Cover
                      </span>
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        left: "4px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        fontSize: "10px",
                        padding: "1px 5px",
                        borderRadius: "2px",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* Thumbnail Controls: Reorder, Set Cover, Remove */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 6px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderTop: "1px solid var(--color-admin-border)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "2px" }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveGalleryImage(idx, -1)}
                        title={t("moveLeft", { defaultValue: "Nach links verschieben" })}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === 0 ? "rgba(255, 255, 255, 0.2)" : "var(--color-admin-muted)",
                          cursor: idx === 0 ? "default" : "pointer",
                          padding: "2px",
                        }}
                      >
                        <Icon name="chevron-left" size={12} />
                      </button>

                      <button
                        type="button"
                        disabled={idx === gallery.length - 1}
                        onClick={() => handleMoveGalleryImage(idx, 1)}
                        title={t("moveRight", { defaultValue: "Nach rechts verschieben" })}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === gallery.length - 1 ? "rgba(255, 255, 255, 0.2)" : "var(--color-admin-muted)",
                          cursor: idx === gallery.length - 1 ? "default" : "pointer",
                          padding: "2px",
                        }}
                      >
                        <Icon name="chevron-right" size={12} />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetAsThumbnail(url)}
                        title={t("setAsCover", { defaultValue: "Als Coverbild festlegen" })}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-secondary)",
                          fontSize: "10px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      title={t("removeImage", { defaultValue: "Bild entfernen" })}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Video, 360 Spin & 3D Model ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-md)",
        }}
      >
        {/* Video URL */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-admin-border)",
          }}
        >
          <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-text)", display: "block", marginBottom: "4px" }}>
            {t("videoUrl", { defaultValue: "Video URL (optional)" })}
          </label>
          <Input
            value={video}
            onChange={(e) => updateMedia("video", e.target.value)}
            placeholder="https://.../walkaround.mp4 oder YouTube"
            style={{ height: "36px", fontSize: "var(--font-size-xs)" }}
          />
          <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)", marginTop: "4px", display: "block" }}>
            {t("videoHint", { defaultValue: "MP4 Video oder Stream-Link für Fahrzeugpräsentation." })}
          </span>
        </div>

        {/* 3D Model URL */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-admin-border)",
          }}
        >
          <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-admin-text)", display: "block", marginBottom: "4px" }}>
            {t("model3dUrl", { defaultValue: "3D-Modell URL (optional)" })}
          </label>
          <Input
            value={model3d}
            onChange={(e) => updateMedia("model_3d", e.target.value)}
            placeholder="https://.../model.glb"
            style={{ height: "36px", fontSize: "var(--font-size-xs)" }}
          />
          <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)", marginTop: "4px", display: "block" }}>
            {t("model3dHint", { defaultValue: "GLB / glTF 3D-Fahrzeugmodell für interaktiven Showroom." })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CarMediaManager;
