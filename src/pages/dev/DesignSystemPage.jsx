import React, { useState, useEffect } from "react";
import { Container, Section, Stack, Grid } from "../../components/ui/Layout";
import { Display, Heading, Text, Eyebrow, Price } from "../../components/ui/Typography";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Badge from "../../components/ui/Badge";
import Divider from "../../components/ui/Divider";
import Modal from "../../components/ui/Modal";
import Drawer from "../../components/ui/Drawer";
import Input from "../../components/forms/Input";
import Textarea from "../../components/forms/Textarea";
import Select from "../../components/forms/Select";
import Checkbox from "../../components/forms/Checkbox";
import FileUpload from "../../components/forms/FileUpload";
import MediaFrame from "../../components/media/MediaFrame";
import CinematicImage from "../../components/media/CinematicImage";
import ImageReveal from "../../components/media/ImageReveal";
import VideoMedia from "../../components/media/VideoMedia";
import CarMediaFrame from "../../components/media/CarMediaFrame";
import CarCardBase from "../../components/automotive/CarCardBase";
import VehicleSpecs from "../../components/automotive/VehicleSpecs";
import FavoriteButton from "../../components/automotive/FavoriteButton";
import Reveal from "../../components/motion/Reveal";
import ScrollReveal from "../../components/motion/ScrollReveal";
import Parallax from "../../components/motion/Parallax";
import CinematicSection from "../../components/motion/CinematicSection";
import HeroPrimitive from "../../components/layout/HeroPrimitive";
import Icon from "../../components/common/Icon";
import { isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Design System Showcase & Verification Page
 * Internal development route (/design-system).
 * Strictly neutral development placeholders.
 */

export function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [reducedMotionActive] = useState(() => isReducedMotion());

  // Form & card interactive demo states
  const [inputValue, setInputValue] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [cardFavorite, setCardFavorite] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh", paddingBottom: "var(--space-5xl)" }}>
      {/* Viewport & Environment Banner */}
      <div
        style={{
          position: "sticky",
          top: "var(--header-height)",
          zIndex: 90,
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "var(--space-xs) var(--space-md)",
          fontSize: "var(--font-size-xs)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
          <Badge variant="secondary">Phase 2: Design System</Badge>
          <span>Viewport: <strong>{windowWidth}px</strong></span>
          <span>Reduced Motion: <strong>{reducedMotionActive ? "Aktiv" : "Aus"}</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Thema wechseln ({themeMode.toUpperCase()})
          </Button>
        </div>
      </div>

      {/* Hero Primitive Showcase */}
      <HeroPrimitive
        eyebrow="Entwicklungsumgebung // Design System"
        title="Automotive Design System"
        subtitle="Modulare, performante und kinoreife Bausteine für die exklusive Fahrzeugpräsentation."
        primaryCtaLabel="Komponenten prüfen"
        onPrimaryCta={() => {
          document.getElementById("components-start")?.scrollIntoView({ behavior: "smooth" });
        }}
        secondaryCtaLabel="Dialog öffnen"
        onSecondaryCta={() => setModalOpen(true)}
      />

      <div id="components-start" />

      {/* Section 1: Color Tokens */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>01 // Farbsystem & Tokens</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Farbpalette & Oberflächen
          </Heading>

          <Grid cols="responsive" gap="md">
            {[
              { name: "Primary", varName: "--color-primary" },
              { name: "Secondary", varName: "--color-secondary" },
              { name: "Background", varName: "--color-background" },
              { name: "Surface", varName: "--color-surface" },
              { name: "Card", varName: "--color-card" },
              { name: "Card Elevated", varName: "--color-card-elevated" },
              { name: "Text", varName: "--color-text" },
              { name: "Text Muted", varName: "--color-text-muted" },
              { name: "Border", varName: "--color-border" },
              { name: "Accent", varName: "--color-accent" },
              { name: "Success", varName: "--color-success" },
              { name: "Warning", varName: "--color-warning" },
              { name: "Error", varName: "--color-error" },
            ].map((token) => (
              <div
                key={token.varName}
                className="surface-card"
                style={{ padding: "var(--space-md)", display: "flex", alignItems: "center", gap: "var(--space-md)" }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: `var(${token.varName})`,
                    border: "1px solid var(--color-border)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{token.name}</div>
                  <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-text-subtle)", fontFamily: "var(--font-family-mono)" }}>
                    {token.varName}
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 2: Typography & German Hyphenation */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>02 // Typografie & Zahlen</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Typografische Hierarchie & Deutsche Wortlängen
          </Heading>

          <Stack direction="column" gap="xl">
            <div>
              <Text variant="caption">DISPLAY 2XL</Text>
              <Display size="2xl">Fahrzeugausstattung</Display>
            </div>
            <div>
              <Text variant="caption">DISPLAY XL</Text>
              <Display size="xl">Garantiebedingungen</Display>
            </div>
            <div>
              <Text variant="caption">HEADING 1 (H1)</Text>
              <Heading level={1}>Kraftstoffverbrauch & Emissionen</Heading>
            </div>
            <div>
              <Text variant="caption">HEADING 2 (H2)</Text>
              <Heading level={2}>Meisterhafte Ingenieurskunst</Heading>
            </div>
            <div>
              <Text variant="caption">HEADING 3 (H3)</Text>
              <Heading level={3}>Individuelle Ausstattungsmerkmale</Heading>
            </div>
            <div>
              <Text variant="caption">BODY LEAD</Text>
              <Text variant="lead">
                Automotive Ästhetik definiert sich durch Präzision im Detail und zurückhaltende Eleganz.
              </Text>
            </div>
            <div>
              <Text variant="caption">BODY STANDARD</Text>
              <Text variant="body">
                Alle technischen Spezifikationen und Verbrauchsangaben werden dynamisch über das Content-Management-System bereitgestellt.
              </Text>
            </div>
            <div>
              <Text variant="caption">NUMERISCHE PREISHIERARCHIE (TABULAR FIGURES)</Text>
              <Stack direction="row" gap="xl" wrap align="baseline">
                <Price value={189500} oldPrice={198000} size="lg" />
                <Price value={84900} size="md" />
                <Price value={42500} size="sm" />
              </Stack>
            </div>
          </Stack>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 3: Buttons & Controls */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>03 // Buttons & Interaktionen</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Button-Varianten & Zustände
          </Heading>

          <Stack direction="column" gap="lg">
            <Stack direction="row" gap="md" wrap align="center">
              <Button variant="primary" size="lg" iconRight="arrow-right">
                Primary Groß
              </Button>
              <Button variant="secondary" size="md" iconLeft="search">
                Secondary
              </Button>
              <Button variant="outline" size="md">
                Outline
              </Button>
              <Button variant="ghost" size="md">
                Ghost
              </Button>
              <Button variant="destructive" size="md">
                Destructive
              </Button>
              <Button variant="text" size="md">
                Text Button
              </Button>
            </Stack>

            <Stack direction="row" gap="md" wrap align="center">
              <Button variant="primary" loading>
                Wird geladen
              </Button>
              <Button variant="secondary" disabled>
                Deaktiviert
              </Button>
              <IconButton icon="search" ariaLabel="Suchen" variant="secondary" />
              <IconButton icon="filter" ariaLabel="Filter" variant="outline" />
              <IconButton icon="heart" ariaLabel="Favorit" variant="ghost" />
              <FavoriteButton isFavorite={cardFavorite} onToggle={setCardFavorite} />
            </Stack>

            <div style={{ marginTop: "var(--space-md)" }}>
              <Text variant="caption">IKONOGRAFIE (AUSZUG)</Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginTop: "var(--space-xs)" }}>
                {["search", "heart", "sliders", "filter", "speedometer", "fuel", "cog", "calendar", "car", "award", "video", "image", "upload", "check", "alert-circle", "info", "phone", "mail", "map-pin", "globe", "user", "shield"].map((iconName) => (
                  <div
                    key={iconName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      backgroundColor: "var(--color-surface)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border-subtle)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    <Icon name={iconName} size={16} style={{ color: "var(--color-secondary)" }} />
                    <span style={{ color: "var(--color-text-muted)" }}>{iconName}</span>
                  </div>
                ))}
              </div>
            </div>
          </Stack>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 4: Form System */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>04 // Formularsystem</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Eingabefelder & Validierungszustände
          </Heading>

          <Grid cols={2} gap="lg">
            <Input
              label="Standard Eingabefeld"
              placeholder="z. B. Vor- und Nachname"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Neutraler Hinweistext"
            />
            <Input
              label="Feld mit Icon & Erfolg"
              value="gueltige.eingabe@beispiel.de"
              startIcon="mail"
              success
              readOnly
            />
            <Input
              label="Fehlerzustand"
              value="Ungültiger Wert"
              error="Bitte überprüfen Sie das Eingabeformat."
              readOnly
            />
            <Input
              label="Ladezustand"
              placeholder="Prüfe Verfügbarkeit..."
              loading
              readOnly
            />
            <Select
              label="Dropdown Auswahl"
              options={[
                { value: "opt1", label: "Option 01 — Standard" },
                { value: "opt2", label: "Option 02 — Premium" },
                { value: "opt3", label: "Option 03 — Exklusiv" },
              ]}
            />
            <Textarea
              label="Nachrichtenfeld (Textarea)"
              placeholder="Ihre Mitteilung an das Team..."
            />
          </Grid>

          <div style={{ marginTop: "var(--space-lg)" }}>
            <Checkbox
              label="Ich bestätige die Datenschutzerklärung und willige in die Verarbeitung ein."
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
            />
          </div>

          <div style={{ marginTop: "var(--space-lg)" }}>
            <FileUpload
              label="Fahrzeugdokumente & Bilder hochladen"
              multiple
              maxFiles={3}
            />
          </div>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 5: Automotive Card Base */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>05 // Fahrzeugkarten-Architektur</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Wiederverwendbare Fahrzeugkarte (CarCardBase)
          </Heading>

          <Grid cols="responsive" gap="lg">
            <CarCardBase
              brand="Porsche"
              name="911 GT3 RS Weissach"
              price={148500}
              oldPrice={159000}
              status="AVAILABLE"
              mileage={18400}
              power={525}
              fuel="Benzin"
              transmission="Automatik"
              registration="05/2023"
              condition="Gebraucht"
              isFavorite={cardFavorite}
              onFavoriteToggle={setCardFavorite}
              ctaLabel="Fahrzeugdetails"
            />

            <CarCardBase
              brand="BMW"
              name="M8 Gran Coupé First Edition"
              price={98900}
              status="RESERVED"
              mileage={32100}
              power={625}
              fuel="Benzin"
              transmission="Automatik"
              registration="11/2022"
              condition="Gebraucht"
              ctaLabel="Fahrzeugdetails"
            />

            <CarCardBase
              brand="Mercedes-AMG"
              name="GT R Roadster Bi-Turbo"
              price={215000}
              status="SOLD"
              mileage={8900}
              power={585}
              fuel="Benzin"
              transmission="Doppelkupplung"
              registration="08/2024"
              condition="Neuwertig"
              ctaLabel="Fahrzeugdetails"
            />
          </Grid>

          <div style={{ marginTop: "var(--space-2xl)" }}>
            <Text variant="caption">STANDALONE SPECS & AUTOMOTIVE STAGE</Text>
            <div style={{ maxWidth: "480px", marginTop: "var(--space-xs)" }}>
              <CarMediaFrame aspectRatio="16-9" badge={<Badge variant="success">Neu eingetroffen</Badge>}>
                <CinematicImage alt="Atmosphärischer Fahrzeugstage" />
              </CarMediaFrame>
              <div style={{ marginTop: "var(--space-md)" }}>
                <VehicleSpecs
                  mileage={14200}
                  fuel="Benzin"
                  transmission="Automatik"
                  registration="03/2024"
                  condition="Unfallfrei"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 6: Automotive Media & Visual Treatments */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>06 // Medien & Bildmasken</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Seitenverhältnisse, Masken & Video-Primitive
          </Heading>

          <Grid cols="responsive" gap="lg">
            <div>
              <Text variant="caption">MEDIENRAHMEN 16:9 MIT CINEMATIC IMAGE</Text>
              <MediaFrame aspectRatio="16-9">
                <CinematicImage alt="Kinoreife Fahrzeugansicht" />
              </MediaFrame>
            </div>
            <div>
              <Text variant="caption">MEDIENRAHMEN 21:9 MIT IMAGE REVEAL</Text>
              <ImageReveal direction="left">
                <MediaFrame aspectRatio="21-9">
                  <CinematicImage alt="Breitbild-Präsentation" />
                </MediaFrame>
              </ImageReveal>
            </div>
            <div>
              <Text variant="caption">VIDEOMEDIUM MIT CONTROLS-OVERLAY</Text>
              <VideoMedia aspectRatio="16-9" />
            </div>
          </Grid>
        </Container>
      </Section>

      <Divider spacing="lg" />

      {/* Section 7: Motion Primitives */}
      <Section spacing="default">
        <Container size="default">
          <Eyebrow>07 // Motion Design System</Eyebrow>
          <Heading level={2} style={{ marginBottom: "var(--space-lg)" }}>
            Kinematische Scroll- & Enthüllungseffekte
          </Heading>

          <Grid cols="responsive" gap="lg">
            <Reveal variant="up" delay={0.1}>
              <div className="surface-card" style={{ padding: "var(--space-lg)" }}>
                <Eyebrow>Reveal [Up]</Eyebrow>
                <Heading level={3}>Sanfte Einblendung</Heading>
                <Text variant="sm">
                  Subtile Bewegung von unten nach oben mit GSAP-Kontext und Mobile-Safety.
                </Text>
              </div>
            </Reveal>

            <Reveal variant="left" delay={0.2}>
              <div className="surface-card" style={{ padding: "var(--space-lg)" }}>
                <Eyebrow>Reveal [Left]</Eyebrow>
                <Heading level={3}>Horizontale Führung</Heading>
                <Text variant="sm">
                  Präzise horizontale Bewegung zur Steuerung des visuellen Flusses.
                </Text>
              </div>
            </Reveal>

            <Parallax speed={0.15}>
              <div
                className="surface-card"
                style={{
                  padding: "var(--space-lg)",
                  border: "1px solid var(--color-secondary)",
                }}
              >
                <Eyebrow>Parallax Layer</Eyebrow>
                <Heading level={3}>Tiefenwirkung</Heading>
                <Text variant="sm">
                  ScrollTrigger-gesteuerte Parallax-Ebene mit automatischer Reduktion auf Mobilgeräten.
                </Text>
              </div>
            </Parallax>
          </Grid>

          <div style={{ marginTop: "var(--space-xl)" }}>
            <ScrollReveal stagger={0.1}>
              <div
                style={{
                  padding: "var(--space-xl)",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  textAlign: "center",
                }}
              >
                <Eyebrow>ScrollReveal Trigger</Eyebrow>
                <Heading level={2}>Enthüllung beim Erreichen des Viewports</Heading>
                <Text variant="body">
                  Aktiviert die Animation erst, wenn das Element die Sichtachse betritt.
                </Text>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      {/* Cinematic Showcase Section */}
      <CinematicSection minHeight="50vh" style={{ marginTop: "var(--space-3xl)" }}>
        <Container size="default" style={{ textAlign: "center" }}>
          <Eyebrow>Cinematic Section Wrapper</Eyebrow>
          <Display size="xl">Atmosphärische Fahrzeugbühne</Display>
          <Text variant="lead" style={{ maxWidth: "600px", margin: "var(--space-md) auto var(--space-xl)" }}>
            Integrierter Container mit sanftem Parallax-Hintergrund, Vignettierung und kinoreifem Farbverlauf.
          </Text>
          <Stack direction="row" gap="md" justify="center" wrap>
            <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
              Modal Dialog testen
            </Button>
            <Button variant="outline" size="lg" onClick={() => setDrawerOpen(true)}>
              Slide-Over Drawer testen
            </Button>
          </Stack>
        </Container>
      </CinematicSection>

      {/* Accessible Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Barrierefreier Modal-Dialog"
      >
        <Stack direction="column" gap="md">
          <Text variant="body">
            Dieser Dialog unterstützt Tastatursteuerung (ESC zum Schließen), sperrt den Hintergrund-Scrollvorgang und nutzt einen dezenten Backdrop-Blur.
          </Text>
          <Input label="Beispiel Eingabe im Dialog" placeholder="Text eingeben..." />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Bestätigen
            </Button>
          </div>
        </Stack>
      </Modal>

      {/* Accessible Drawer Demo */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter & Navigation Drawer"
      >
        <Stack direction="column" gap="md">
          <Text variant="body">
            Slide-Over Panel für mobile Navigation und erweiterte Filteroptionen im Fahrzeugbestand.
          </Text>
          <Input label="Suchbegriff" placeholder="Modell, Marke..." />
          <Select
            label="Kraftstoffart"
            options={[
              { value: "benzin", label: "Benzin" },
              { value: "diesel", label: "Diesel" },
              { value: "hybrid", label: "Hybrid" },
              { value: "elektro", label: "Elektro" },
            ]}
          />
          <Checkbox label="Nur verfügbare Fahrzeuge" checked />
          <Button variant="primary" style={{ marginTop: "var(--space-md)" }} onClick={() => setDrawerOpen(false)}>
            Filter anwenden
          </Button>
        </Stack>
      </Drawer>
    </div>
  );
}

export default DesignSystemPage;
