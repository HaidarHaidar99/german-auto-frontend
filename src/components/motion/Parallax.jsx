import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Parallax Motion Layer
 * ScrollTrigger-driven depth layer with automatic mobile dampening and cleanup.
 */

export function Parallax({
  children,
  speed = 0.2, // Movement factor
  className = "",
  style = {},
}) {
  const triggerRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !triggerRef.current || !targetRef.current) return;

    const trigger = triggerRef.current;
    const target = targetRef.current;
    const isMobile = window.innerWidth < 768;
    const actualSpeed = isMobile ? speed * 0.4 : speed;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { y: -50 * actualSpeed },
        {
          y: 50 * actualSpeed,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, trigger);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={triggerRef}
      className={`parallax-container ${className}`.trim()}
      style={{ overflow: "hidden", position: "relative", ...style }}
    >
      <div
        ref={targetRef}
        style={{ willChange: "transform", width: "100%", height: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}

export default Parallax;
