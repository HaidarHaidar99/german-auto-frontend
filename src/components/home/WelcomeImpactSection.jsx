import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
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
 * - Single showcase image (1.jpeg) smoothly transforms as the user scrolls down.
 * - 4 equal pictures (2, 3, 4, 5.jpeg) progressively appear and expand into their final positions.
 * - The entire card participates in the animation (scale, elevation, border glow).
 * - 4 images seamlessly fill the card area with zero unwanted empty spaces or gaps.
 * - Gold phrase below ("You are in the right place" / "Hier sind Sie genau richtig") reveals naturally.
 * - One-way scroll-down animation that locks in place and does not disappear when scrolling up.
 */
export function WelcomeImpactSection() {
  const { isDark } = useTheme?.() || { isDark: true };
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
      // Fires ONLY when scrolling down into view, locks in final state, never reverses on scroll-up
      const st = {
        trigger: sectionRef.current,
        start: "top 82%",
        toggleActions: "play none none none",
        once: true,
      };

      // 1. Entire card: rise up, scale in, luxury glow border
      gsap.fromTo(
        cardRef.current,
        { scale: 0.92, y: 40, opacity: 0, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", borderColor: "rgba(212,175,55,0.15)" },
        { scale: 1, y: 0, opacity: 1, boxShadow: "0 22px 55px rgba(0,0,0,0.75), 0 0 35px rgba(212,175,55,0.22)", borderColor: "rgba(212,175,55,0.45)", duration: 0.75, ease: "power3.out", scrollTrigger: st }
      );

      // 2. Single image dissolves out smoothly after card snaps into view
      gsap.fromTo(
        singleImgRef.current,
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 1.05, duration: 0.6, ease: "power2.inOut", delay: 0.2, scrollTrigger: st }
      );

      // 3. Four images: reveal and expand from their quadrants
      const quadrantFroms = [
        { xPercent: 8, yPercent: 8 },  // TL
        { xPercent: -8, yPercent: 8 },  // TR
        { xPercent: 8, yPercent: -8 }, // BL
        { xPercent: -8, yPercent: -8 }, // BR
      ];
      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85, xPercent: quadrantFroms[i].xPercent, yPercent: quadrantFroms[i].yPercent },
          { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, duration: 0.65, ease: "power3.out", delay: 0.3 + i * 0.06, scrollTrigger: st }
        );
      });

      // 4. Gold phrase fades up after images appear
      if (phraseContentRef.current) {
        gsap.fromTo(
          phraseContentRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", delay: 0.7, scrollTrigger: st }
        );
      }

      // 5. Accent lines expand
      if (accentLinesRef.current) {
        gsap.fromTo(
          accentLinesRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.85, scrollTrigger: st }
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
              zIndex: 3, // On top of the 4 images so it shows initially and dissolves out
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
              zIndex: 2, // Beneath the single image layer
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
                    backgroundColor: "transparent",
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
                fontSize: "clamp(1.75rem, 4.2vw, 3.1rem)",
                fontWeight: 700,
                fontFamily: "'Cinzel', 'Playfair Display', 'DM Serif Display', Georgia, serif",
                lineHeight: 1.2,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {phraseText}
            </h2>

            {/* Decorative Gold Accent Lines with Website Star */}
            <div
              ref={accentLinesRef}
              className="gold-phrase-accents"
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
                className="gold-accent-line left"
                style={{
                  width: "45px",
                  height: "1px",
                }}
              />
              <span
                className="gold-accent-star"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                ✦
              </span>
              <div
                className="gold-accent-line right"
                style={{
                  width: "45px",
                  height: "1px",
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

        /* Gold Phrase Title - robust cross-theme gradient text */
        .gold-phrase-title {
          background: linear-gradient(135deg, #FFF4CC 0%, #F5D77F 25%, #D4AF37 60%, #AA771C 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: #D4AF37;
          filter: none !important;
          text-shadow: none !important;
        }

        [data-theme="light"] .gold-phrase-title,
        .theme-light .gold-phrase-title {
          background: linear-gradient(135deg, #8A5A00 0%, #B37D14 30%, #C99726 65%, #7A4E00 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: #8A5A00;
          filter: none !important;
          text-shadow: none !important;
        }

        /* Gold Accents */
        .gold-accent-line.left {
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8));
        }
        .gold-accent-line.right {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.8), transparent);
        }
        .gold-accent-star {
          color: #D4AF37;
        }

        [data-theme="light"] .gold-accent-line.left,
        .theme-light .gold-accent-line.left {
          background: linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.8));
        }
        [data-theme="light"] .gold-accent-line.right,
        .theme-light .gold-accent-line.right {
          background: linear-gradient(90deg, rgba(184, 134, 11, 0.8), transparent);
        }
        [data-theme="light"] .gold-accent-star,
        .theme-light .gold-accent-star {
          color: #B8860B;
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
