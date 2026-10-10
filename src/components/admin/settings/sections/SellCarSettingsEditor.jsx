import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Textarea from "../../../forms/Textarea";

export function SellCarSettingsEditor({
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

  return (
    <SettingsSection
      title={t("settingsSections.sellCar", { defaultValue: "Fahrzeugankauf-Einstellungen" })}
      subtitle={t("sellCarSubtitle", {
        defaultValue: "Steuern Sie Texte, Handlungsaufforderungen und Sichtbarkeit des Ankauf-Bereichs.",
      })}
      sectionKey="sell_car"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/sell-your-car"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label="Fahrzeugankauf-Modul aktivieren"
          description="Ermöglicht Besuchern das Einreichen von Fahrzeugdaten zur diskreten Wertermittlung."
          checked={data.enabled !== false}
          onChange={(checked) => handleChange("enabled", checked)}
        />
      </div>

      <SettingsField label="Haupttitel (DE)" locale="de" error={errors["sell_car.title_de"]}>
        <Input
          value={data.title_de || ""}
          onChange={(e) => handleChange("title_de", e.target.value)}
          placeholder="Fahrzeug bewerten & verkaufen"
        />
      </SettingsField>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label="Beschreibung (DE)" locale="de" error={errors["sell_car.description_de"]}>
          <Textarea
            value={data.description_de || ""}
            onChange={(e) => handleChange("description_de", e.target.value)}
            placeholder="Reichen Sie die Daten Ihres Automobils für eine fundierte Begutachtung ein..."
            rows={3}
          />
        </SettingsField>
      </div>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label="Button-Text (DE)" locale="de" error={errors["sell_car.cta_text_de"]}>
          <Input
            value={data.cta_text_de || ""}
            onChange={(e) => handleChange("cta_text_de", e.target.value)}
            placeholder="Jetzt bewerten"
          />
        </SettingsField>
      </div>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label="Bild- / Medien-URL" helper="Optionales Kampagnen- oder Hintergrundbild" error={errors["sell_car.media_url"]}>
          <Input
            value={data.media_url || ""}
            onChange={(e) => handleChange("media_url", e.target.value)}
            placeholder="https://..."
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default SellCarSettingsEditor;
