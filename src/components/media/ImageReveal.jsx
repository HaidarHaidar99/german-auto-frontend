import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { isReducedMotion } from "../../utils/animation";

/**
 * German Auto — ImageReveal Component
 * High-end directional mask reveal using clip-path with GSAP context.
 */

export function ImageReveal({
  children,
  direction = "left", // 'left' | 'right' | 'up' | 'down'
  duration = 1.1,
  delay = 0,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    const el = containerRef.current;
    const initialClip = {
      left: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      right: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      up: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      down: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    }[direction] || "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";

    const targetClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: initialClip },
        {
          clipPath: targetClip,
          duration,
          delay,
          ease: "power3.inOut",
        }
      );
    }, el);

    return () => ctx.revert();
  }, [direction, duration, delay]);

  return (
    <div
      ref={containerRef}
      className={`image-reveal-container ${className}`.trim()}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default ImageReveal;
