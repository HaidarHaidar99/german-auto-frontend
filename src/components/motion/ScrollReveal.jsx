import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — ScrollReveal Component
 * Reveals elements sequentially as they scroll into view.
 */

export function ScrollReveal({
  children,
  y = 35,
  duration = 0.85,
  delay = 0,
  stagger = 0,
  start = "top 88%",
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    const el = containerRef.current;
    const isMobile = window.innerWidth < 768;
    const actualY = isMobile ? Math.min(y, 20) : y;

    const ctx = gsap.context(() => {
      const targets = stagger > 0 ? el.children : el;

      gsap.fromTo(
        targets,
        { opacity: 0, y: actualY },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger: stagger > 0 ? stagger : 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [y, duration, delay, stagger, start]);

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal ${className}`.trim()}
      style={{ willChange: "transform, opacity", ...style }}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
