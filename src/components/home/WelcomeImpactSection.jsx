import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Layout";
import { gsap, ScrollTrigger, isReducedMotion } from "../../utils/animation";
import img1 from "../../assets/4images/1.jpeg";
import img2 from "../../assets/4images/2.jpeg";
import img3 from "../../assets/4images/3.jpeg";
import img4 from "../../assets/4images/4.jpeg";
import img5 from "../../assets/4images/5.jpeg";

/**
 * WelcomeImpactSection
 * Positioned directly under the Home Page hero.
 * Fully scroll-driven transition:
 * - Single showcase image (1.jpeg) smoothly transforms as the user scrolls.
 * - 4 equal pictures (2, 3, 4, 5.jpeg) progressively appear and expand into their final positions.
 * - The entire card participates in the animation (subtle scale, elevation, border glow).
 * - 4 images seamlessly fill the card area with zero unwanted empty spaces or gaps.
 * - Gold phrase below ("You are in the right place" / "Hier sind Sie genau richtig") reveals naturally.
 * - Fully reversible when scrolling up, and re-triggers on every scroll without requiring a refresh.
 */
export function WelcomeImpactSection() {
  const { t, i18n } = useTranslation(["common"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";
  const phraseText = t(
    "welcomePhrase",
    currentLang === "en" ? "You are in the right place" : "Hier sind Sie genau richtig"
  );

  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const singleImgRef = useRef(null);
  const imgRefs = useRef([]);
  const phraseContentRef = useRef(null);
  const accentLinesRef = useRef(null);

  const fourImages = [
    { src: img2, alt: "König Automobile Showroom" },
    { src: img3, alt: "König Automobile Exterior" },
    { src: img4, alt: "König Automobile Vehicle Fleet" },
    { src: img5, alt: "König Automobile Premium Selection" },
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    // Accessibility safeguard: if user prefers reduced motion, present final state cleanly
    if (isReducedMotion()) {
      if (singleImgRef.current) singleImgRef.current.style.opacity = "0";
      if (phraseContentRef.current) phraseContentRef.current.style.opacity = "1";
      if (accentLinesRef.current) accentLinesRef.current.style.opacity = "1";
      imgRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 18%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Refresh measurements once DOM and styles settle
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      // 1. Entire card container moves and transforms
      tl.fromTo(
        cardRef.current,
        {
          scale: 0.94,
          y: 35,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          borderColor: "rgba(212, 175, 55, 0.2)",
        },
        {
          scale: 1,
          y: 0,
          boxShadow: "0 22px 55px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.22)",
          borderColor: "rgba(212, 175, 55, 0.45)",
          ease: "none",
          duration: 1,
        },
        0
      );

      // 2. Single image layer dissolves and slightly expands
      tl.fromTo(
        singleImgRef.current,
        {
          opacity: 1,
          scale: 1,
        },
        {
          opacity: 0,
          scale: 1.06,
          ease: "none",
          duration: 0.65,
        },
        0.05
      );

      // 3. Four images progressively appear and expand into their final quadrant positions
      // Top-Left (0): expands outward from center
      if (imgRefs.current[0]) {
        tl.fromTo(
          imgRefs.current[0],
          { opacity: 0, scale: 0.78, xPercent: 12, yPercent: 12 },
          { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, ease: "none", duration: 0.6 },
          0.15
        );
      }
      // Top-Right (1): expands outward from center
      if (imgRefs.current[1]) {
        tl.fromTo(
          imgRefs.current[1],
          { opacity: 0, scale: 0.78, xPercent: -12, yPercent: 12 },
          { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, ease: "none", duration: 0.6 },
          0.18
        );
      }
      // Bottom-Left (2): expands outward from center
      if (imgRefs.current[2]) {
        tl.fromTo(
          imgRefs.current[2],
          { opacity: 0, scale: 0.78, xPercent: 12, yPercent: -12 },
          { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, ease: "none", duration: 0.6 },
          0.21
        );
      }
      // Bottom-Right (3): expands outward from center
      if (imgRefs.current[3]) {
        tl.fromTo(
          imgRefs.current[3],
          { opacity: 0, scale: 0.78, xPercent: -12, yPercent: -12 },
          { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, ease: "none", duration: 0.6 },
          0.24
        );
      }

      // 4. Gold phrase flows in smoothly after images reach final positions
      if (phraseContentRef.current) {
        tl.fromTo(
          phraseContentRef.current,
          {
            opacity: 0,
            y: 28,
          },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            duration: 0.35,
          },
          0.65
        );
      }

      // 5. Expand decorative gold accent lines
      if (accentLinesRef.current) {
        tl.fromTo(
          accentLinesRef.current,
          {
            scaleX: 0,
            opacity: 0,
          },
          {
            scaleX: 1,
            opacity: 1,
            ease: "none",
            duration: 0.25,
          },
          0.75
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="welcome-impact-section"
      style={{
        position: "relative",
        padding: "clamp(32px, 6vw, 64px) 0",
        backgroundColor: "transparent",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Container size="default">
        {/* Main Showcase Card Container */}
        <div
          ref={cardRef}
          className="welcome-impact-card"
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(340px, 48vh, 520px)",
            borderRadius: "var(--radius-xl, 24px)",
            border: "1px solid rgba(212, 175, 55, 0.28)",
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.55)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0c0e12 0%, #15181e 100%)",
            boxSizing: "border-box",
          }}
        >
          {/* Ambient Gold Radial Glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.12) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* ── STEP 1: Single Background Image Layer (1.jpeg) ── */}
          <div
            ref={singleImgRef}
            className="single-image-layer"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <img
              src={img1}
              alt="König Automobile Rheinberg"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
            {/* Elegant Vignette Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(12, 14, 18, 0.2) 0%, rgba(12, 14, 18, 0.6) 100%)",
              }}
            />
          </div>

          {/* ── STEP 2: The 4-Image Seamless Quadrant Layout (2, 3, 4, 5.jpeg) ── */}
          <div
            className="four-images-layout"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 0, // Zero gaps so images seamlessly fill the entire card area
              overflow: "hidden",
            }}
          >
            {fourImages.map((item, idx) => {
              // Subtle hairline borders between quadrants
              const borderStyles = {};
              if (idx % 2 === 0) {
                borderStyles.borderRight = "1px solid rgba(212, 175, 55, 0.22)";
              }
              if (idx < 2) {
                borderStyles.borderBottom = "1px solid rgba(212, 175, 55, 0.22)";
              }

              return (
                <div
                  key={idx}
                  className="quadrant-cell"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    backgroundColor: "#0d0f12",
                    boxSizing: "border-box",
                    ...borderStyles,
                  }}
                >
                  <div
                    ref={(el) => {
                      imgRefs.current[idx] = el;
                    }}
                    className="quadrant-image-wrapper"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                        transition: "transform 0.4s ease",
                      }}
                    />
                    {/* Subtle Inner Glass Vignette */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%, rgba(0, 0, 0, 0.45) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: Scroll-Driven Phrase Below the Card ── */}
        <div
          className="gold-phrase-container"
          style={{
            marginTop: "clamp(24px, 4vw, 36px)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            ref={phraseContentRef}
            className="gold-phrase-content"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <h2
              className="gold-phrase-title"
              style={{
                margin: 0,
                fontSize: "clamp(1.85rem, 4.5vw, 3.2rem)",
                fontWeight: 800,
                fontFamily: "var(--font-family-display, 'DM Serif Display', Georgia, serif)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                background:
                  "linear-gradient(135deg, #FFF4CC 0%, #F5D77F 25%, #D4AF37 60%, #AA771C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 18px rgba(212, 175, 55, 0.45))",
                textAlign: "center",
              }}
            >
              {phraseText}
            </h2>

            {/* Decorative Gold Accent Lines with Website Star */}
            <div
              ref={accentLinesRef}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                marginTop: "12px",
                transformOrigin: "center center",
              }}
            >
              <div
                style={{
                  width: "45px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8))",
                }}
              />
              <span
                style={{
                  color: "#D4AF37",
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                ✦
              </span>
              <div
                style={{
                  width: "45px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, rgba(212, 175, 55, 0.8), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </Container>

      <style>{`
        /* Interactive subtle zoom on individual quadrant image on hover */
        .quadrant-cell:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .welcome-impact-card {
            height: clamp(320px, 46vh, 440px) !important;
          }
        }
      `}</style>
    </section>
  );
}

export default WelcomeImpactSection;
