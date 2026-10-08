import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initSmoothScroll, isReducedMotion } from "../utils/animation";

/**
 * Hook to initialize and clean up Lenis smooth scrolling
 */
export function useSmoothScroll(enabled = true) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled || isReducedMotion()) return;

    const lenis = initSmoothScroll();
    lenisRef.current = lenis;

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}

/**
 * Hook to execute GSAP animations scoped to a React ref with guaranteed cleanup
 */
export function useGsapContext(scopeRef, animationFn, deps = []) {
  useEffect(() => {
    if (!scopeRef.current || isReducedMotion()) return;

    const ctx = gsap.context(() => {
      animationFn();
    }, scopeRef);

    return () => {
      try {
        ctx.revert();
      } catch (err) {
        // Safe catch if nodes were already unmounted or detached
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to reveal an element smoothly as it enters the viewport
 */
export function useScrollReveal(elementRef, options = {}) {
  useEffect(() => {
    if (!elementRef.current || isReducedMotion()) return;

    const el = elementRef.current;
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: options.y || 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: options.duration || 0.8,
        ease: options.ease || "power2.out",
        scrollTrigger: {
          trigger: el,
          start: options.start || "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [elementRef, options]);
}
