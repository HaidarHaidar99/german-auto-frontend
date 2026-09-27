import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — PageTransition Container
 * Subtle non-blocking route transition.
 */

export function PageTransition({
  children,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    const el = containerRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`page-transition-wrap ${className}`.trim()}
      style={{ width: "100%", ...style }}
    >
      {children}
    </div>
  );
}

export default PageTransition;
