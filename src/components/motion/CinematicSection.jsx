import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — CinematicSection Component
 * Pinned or progressive atmospheric automotive section container.
 */

export function CinematicSection({
  children,
  backgroundMedia,
  overlayGradient = true,
  minHeight = "70vh",
  className = "",
  style = {},
}) {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !sectionRef.current || !bgRef.current) return;

    const section = sectionRef.current;
    const bg = bgRef.current;
    const isMobile = window.innerWidth < 768;

    if (isMobile) return; // Keep mobile lightweight and smooth

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg,
        { y: -30, scale: 1.05 },
        {
          y: 30,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`cinematic-section ${className}`.trim()}
      style={{
        position: "relative",
        minHeight,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* Background Layer */}
      {backgroundMedia && (
        <div
          ref={bgRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          {backgroundMedia}
        </div>
      )}

      {/* Atmospheric Cinematic Gradient Mask */}
      {overlayGradient && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--gradient-cinematic-mask)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content Slot */}
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        {children}
      </div>
    </section>
  );
}

export default CinematicSection;
