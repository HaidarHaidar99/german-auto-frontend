import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import Input from "../../../forms/Input";
import Textarea from "../../../forms/Textarea";
import MediaUploadField from "../MediaUploadField";
import settingsService from "../../../../services/settings/settings.service";

export function AboutSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleChange = (field, val) => {
    onChange?.({
      ...data,
      [field]: val,
    });
  };

  const handleUploadMedia = async (file) => {
    const res = await settingsService.uploadHeroMedia(file);
    const uploadedUrl = res?.data?.url || res?.url;
    if (uploadedUrl) {
      handleChange("media_url", uploadedUrl);
    }
    return res;
  };

  return (
    <SettingsSection
      title={t("settingsSections.about", { defaultValue: "Über uns / About Us" })}
      subtitle={t("aboutSubtitle", {
        defaultValue: "Verwalten Sie die Texte, Unternehmensgeschichte, Kennzahlen und das Leitbild der Über-uns-Seite.",
      })}
      sectionKey="about"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/about"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Title DE & EN */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
          <SettingsField label={t("aboutTitleDe", { defaultValue: "Haupttitel (DE)" })} locale="de" error={errors["about.title_de"]}>
            <Input
              value={data.title_de || ""}
              onChange={(e) => handleChange("title_de", e.target.value)}
              placeholder="Über German Auto"
            />
          </SettingsField>

          <SettingsField label={t("aboutTitleEn", { defaultValue: "Page Title (EN)" })} locale="en" error={errors["about.title_en"]}>
            <Input
              value={data.title_en || ""}
              onChange={(e) => handleChange("title_en", e.target.value)}
              placeholder="About German Auto"
            />
          </SettingsField>
        </div>

        {/* Subtitle DE & EN */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
          <SettingsField label={t("aboutSubtitleDe", { defaultValue: "Untertitel / Slogan (DE)" })} locale="de" error={errors["about.subtitle_de"]}>
            <Input
              value={data.subtitle_de || ""}
              onChange={(e) => handleChange("subtitle_de", e.target.value)}
              placeholder="Leidenschaft, Präzision & automobile Perfektion"
            />
          </SettingsField>

          <SettingsField label={t("aboutSubtitleEn", { defaultValue: "Subtitle / Tagline (EN)" })} locale="en" error={errors["about.subtitle_en"]}>
            <Input
              value={data.subtitle_en || ""}
              onChange={(e) => handleChange("subtitle_en", e.target.value)}
              placeholder="Passion, precision & automotive perfection"
            />
          </SettingsField>
        </div>

        {/* Story Description DE & EN */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
          <SettingsField label={t("aboutStoryDe", { defaultValue: "Unternehmensgeschichte / Story (DE)" })} locale="de" error={errors["about.story_de"]}>
            <Textarea
              value={data.story_de || ""}
              onChange={(e) => handleChange("story_de", e.target.value)}
              placeholder="German Auto steht seit vielen Jahren für erstklassige Luxusfahrzeuge..."
              rows={4}
            />
          </SettingsField>

          <SettingsField label={t("aboutStoryEn", { defaultValue: "Company Story & Mission (EN)" })} locale="en" error={errors["about.story_en"]}>
            <Textarea
              value={data.story_en || ""}
              onChange={(e) => handleChange("story_en", e.target.value)}
              placeholder="German Auto has represented first-class luxury vehicles for years..."
              rows={4}
            />
          </SettingsField>
        </div>

        {/* Key Metrics / Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
          <SettingsField label={t("yearsExperience", { defaultValue: "Jahre Erfahrung" })} error={errors["about.years_experience"]}>
            <Input
              type="number"
              min="0"
              value={data.years_experience ?? 15}
              onChange={(e) => handleChange("years_experience", Number(e.target.value))}
              placeholder="15"
            />
          </SettingsField>

          <SettingsField label={t("vehiclesSold", { defaultValue: "Verkaufte Fahrzeuge" })} error={errors["about.vehicles_sold"]}>
            <Input
              type="number"
              min="0"
              value={data.vehicles_sold ?? 2500}
              onChange={(e) => handleChange("vehicles_sold", Number(e.target.value))}
              placeholder="2500"
            />
          </SettingsField>

          <SettingsField label={t("satisfactionRate", { defaultValue: "Kundenzufriedenheit (%)" })} error={errors["about.satisfaction_rate"]}>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.satisfaction_rate ?? 99}
              onChange={(e) => handleChange("satisfaction_rate", Number(e.target.value))}
              placeholder="99"
            />
          </SettingsField>
        </div>

        {/* Hero Media Upload */}
        <MediaUploadField
          label={t("aboutMedia", { defaultValue: "Titelbild / Hintergrundfoto der Über-uns-Seite" })}
          value={data.media_url || ""}
          accept="image/png, image/jpeg, image/webp, .png, .jpg, .jpeg, .webp"
          maxSizeMB={10}
          onChange={(val) => handleChange("media_url", val)}
          onUpload={handleUploadMedia}
          helper={t("aboutMediaHelper", {
            defaultValue: "Wird als dramatischer Header-Hintergrund auf der Über-uns-Seite dargestellt (JPG/PNG/WEBP empfohlen).",
          })}
          error={errors["about.media_url"]}
        />
      </div>
    </SettingsSection>
  );
}

export default AboutSettingsEditor;
