import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Reveal Component
 * Micro-reveal entrance animation with GSAP context and reduced motion safety.
 */

export function Reveal({
  children,
  variant = "up", // 'up' | 'down' | 'left' | 'right' | 'fade'
  distance = 30,
  duration = 0.8,
  delay = 0,
  ease = "power3.out",
  className = "",
  style = {},
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !elementRef.current) return;

    const el = elementRef.current;
    const isMobile = window.innerWidth < 768;
    const actualDistance = isMobile ? Math.min(distance, 16) : distance;

    const initialVars = {
      opacity: 0,
      x: variant === "left" ? -actualDistance : variant === "right" ? actualDistance : 0,
      y: variant === "up" ? actualDistance : variant === "down" ? -actualDistance : 0,
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        initialVars,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease,
        }
      );
    }, el);

    return () => ctx.revert();
  }, [variant, distance, duration, delay, ease]);

  return (
    <div
      ref={elementRef}
      className={`reveal-motion ${className}`.trim()}
      style={{ willChange: "transform, opacity", ...style }}
    >
      {children}
    </div>
  );
}

export default Reveal;
