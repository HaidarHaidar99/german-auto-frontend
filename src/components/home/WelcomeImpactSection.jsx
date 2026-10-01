import React, { useState, useEffect, useRef } from "react";
import { Container } from "../ui/Layout";
import img1 from "../../assets/4images/1.jpeg";
import img2 from "../../assets/4images/2.jpeg";
import img3 from "../../assets/4images/3.jpeg";
import img4 from "../../assets/4images/4.jpeg";
import img5 from "../../assets/4images/5.jpeg";

/**
 * WelcomeImpactSection
 * Positioned directly under the Home Page hero.
 * Animation sequence when scrolled into view:
 * 1. [0s - 1s]: Card appears with full background image (1.jpeg).
 * 2. [1s]: 4 equal pictures (2, 3, 4, 5.jpeg) hit with impact to replace the background image.
 * 3. [2s]: 1 second after the hit, the phrase flows and hits under the card:
 *    "You're in the right place" (in radiant gold).
 * 4. User smoothly continues scrolling down the page.
 */
export function WelcomeImpactSection() {
  const sectionRef = useRef(null);

  // Animation Stage: 0 = not in view, 1 = bg image visible (1s), 2 = 4 images hit, 3 = gold phrase flows & hits
  const [stage, setStage] = useState(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          // Step 1: Card in view, background 1.jpeg shows for the first 1 second
          setStage(1);

          // Step 2: After 1 second, 4 images hit and displace 1.jpeg
          const t1 = setTimeout(() => {
            setStage(2);
          }, 1000);

          // Step 3: After another 1 second (2s total), the phrase flows and hits under the card
          const t2 = setTimeout(() => {
            setStage(3);
          }, 2000);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const fourImages = [
    { src: img2, alt: "Showcase 1" },
    { src: img3, alt: "Showcase 2" },
    { src: img4, alt: "Showcase 3" },
    { src: img5, alt: "Showcase 4" },
  ];

  return (
    <section
      ref={sectionRef}
      className="welcome-impact-section"
      style={{
        position: "relative",
        padding: "clamp(30px, 5vw, 60px) 0",
        backgroundColor: "transparent",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      <Container size="default">
        {/* Main Showcase Card Container */}
        <div
          className={`welcome-impact-card ${stage >= 2 ? "card-hit-active" : ""}`}
          style={{
            position: "relative",
            width: "100%",
            minHeight: "clamp(340px, 48vh, 480px)",
            borderRadius: "var(--radius-xl, 24px)",
            border: "1px solid rgba(212, 175, 55, 0.28)",
            touchAction: "pan-y",
            boxShadow:
              stage >= 2
                ? "0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.22)"
                : "0 14px 40px rgba(0, 0, 0, 0.55)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0c0e12 0%, #15181e 100%)",
            transition: "border-color 0.5s ease, box-shadow 0.5s ease",
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

          {/* ── STEP 1: First Background Image (1.jpeg) ── */}
          <div
            className="first-bg-layer"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              opacity: stage === 1 ? 1 : stage >= 2 ? 0 : 0.4,
              transform: stage >= 2 ? "scale(1.08) filter(blur(6px))" : "scale(1)",
              transition: "opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s ease",
              pointerEvents: stage >= 2 ? "none" : "auto",
            }}
          >
            <img
              src={img1}
              alt="German Auto Experience"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Elegant Vignette Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(12, 14, 18, 0.2) 0%, rgba(12, 14, 18, 0.65) 100%)",
              }}
            />
          </div>

          {/* Golden Shockwave Pulse on Hit */}
          {stage >= 2 && <div className="impact-shockwave-ring" />}

          {/* ── STEP 2: The 4 Equal Images Hit In (2, 3, 4, 5.jpeg) ── */}
          <div
            className={`four-images-grid-wrapper ${stage >= 2 ? "hit-landed" : ""}`}
            style={{
              position: "relative",
              zIndex: 3,
              width: "100%",
              height: "100%",
              padding: "clamp(16px, 3vw, 28px)",
              display: stage >= 2 ? "grid" : "none",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "clamp(12px, 2vw, 20px)",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            {fourImages.map((item, idx) => (
              <div
                key={idx}
                className="equal-hit-image-card"
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  backgroundColor: "#0d0f12",
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.6)",
                  aspectRatio: "4 / 3",
                  width: "100%",
                  maxHeight: "360px",
                  animation:
                    stage >= 2
                      ? `imageHitImpact 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 60}ms forwards`
                      : "none",
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.4s ease",
                  }}
                />
                {/* Subtle Inner Glass Glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 60%, rgba(0, 0, 0, 0.5) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 3: The Phrase Flows and Hits Under the Card ── */}
        <div
          className={`gold-phrase-container ${stage >= 3 ? "phrase-hit-active" : ""}`}
          style={{
            marginTop: "clamp(24px, 4vw, 36px)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70px",
          }}
        >
          {stage >= 3 && (
            <div className="gold-phrase-content">
              <h2
                className="gold-phrase-title"
                style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 5vw, 3.4rem)",
                  fontWeight: 800,
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  background:
                    "linear-gradient(135deg, #FFF4CC 0%, #F5D77F 25%, #D4AF37 60%, #AA771C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 18px rgba(212, 175, 55, 0.45))",
                }}
              >
                You're in the right place
              </h2>

              {/* Decorative Gold Accent Lines */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  marginTop: "12px",
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
          )}
        </div>
      </Container>

      {/* Embedded CSS Animations */}
      <style>{`
        /* Impact Slam Keyframe for the 4 images */
        @keyframes imageHitImpact {
          0% {
            opacity: 0;
            transform: scale(1.4) translateY(-30px);
            filter: brightness(1.8) blur(4px);
          }
          65% {
            opacity: 1;
            transform: scale(0.97) translateY(4px);
            filter: brightness(1.1) blur(0);
          }
          85% {
            transform: scale(1.02) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: brightness(1) blur(0);
          }
        }

        /* Card Impact Micro-Shake */
        .welcome-impact-card.card-hit-active {
          animation: cardShakeImpact 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes cardShakeImpact {
          0% {
            transform: scale(1);
          }
          20% {
            transform: scale(0.992) translateY(3px);
          }
          40% {
            transform: scale(1.006) translateY(-2px);
          }
          60% {
            transform: scale(0.998) translateY(1px);
          }
          80% {
            transform: scale(1.002);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        /* Golden Shockwave on hit */
        .impact-shockwave-ring {
          position: absolute;
          inset: -20px;
          border-radius: var(--radius-xl, 24px);
          border: 2px solid rgba(212, 175, 55, 0.8);
          pointer-events: none;
          z-index: 5;
          animation: shockwaveExpand 0.7s ease-out forwards;
        }

        @keyframes shockwaveExpand {
          0% {
            opacity: 0.9;
            transform: scale(0.96);
          }
          100% {
            opacity: 0;
            transform: scale(1.08);
          }
        }

        /* Hover effect on each equal image */
        .equal-hit-image-card:hover img {
          transform: scale(1.06);
        }

        .equal-hit-image-card:hover {
          border-color: #D4AF37 !important;
          box-shadow: 0 14px 34px rgba(212, 175, 55, 0.35) !important;
        }

        /* Phrase Flows and Hits Under Card */
        .gold-phrase-content {
          animation: phraseFlowAndHit 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes phraseFlowAndHit {
          0% {
            opacity: 0;
            transform: translateY(-32px) scale(0.88);
            filter: blur(8px);
            letter-spacing: 0.12em;
          }
          60% {
            opacity: 1;
            transform: translateY(6px) scale(1.04);
            filter: blur(0);
          }
          80% {
            transform: translateY(-2px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
            letter-spacing: -0.01em;
          }
        }

        @media (max-width: 768px) {
          .four-images-grid-wrapper {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }

          .welcome-impact-card {
            min-height: 380px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default WelcomeImpactSection;
