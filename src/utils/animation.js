/**
 * German Auto — Animation Infrastructure & Utilities
 * Integrates GSAP + ScrollTrigger and Lenis smooth scrolling with accessibility safeguards.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Register GSAP plugins safely in browser environments
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks whether user prefers reduced motion
 */
export function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Checks whether current viewport is a mobile device (< 768px)
 */
export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * Initializes accessible Lenis smooth scrolling
 */
export function initSmoothScroll(options = {}) {
  // Respect reduced motion, server-side rendering, and mobile viewports.
  // Mobile touch screens have native 120Hz hardware momentum scrolling;
  // virtual smooth scrolling on touch screens intercepts touch events and causes unnatural catching.
  if (typeof window === "undefined" || isReducedMotion() || isMobileViewport()) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    infinite: false,
    ...options,
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  const updateScrollTrigger = () => ScrollTrigger.update();
  lenis.on("scroll", updateScrollTrigger);

  const tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  // Expose on window for global scroll synchronization
  window.__lenis = lenis;

  // Return wrapped object with full cleanup
  return {
    instance: lenis,
    destroy: () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (window.__lenis === lenis) {
        window.__lenis = null;
      }
    },
  };
}

export { gsap, ScrollTrigger, Lenis };
