import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * AosManager
 * Initializes and manages AOS (Animate On Scroll) across the entire application,
 * mirroring the exact smooth scroll & reveal physics from autoweltnoris.de.
 */
export function AosManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    AOS.init({
      duration: isMobile ? 550 : 700,
      easing: "ease-out-cubic",
      once: true, // Animates on scroll down and stays visible permanently
      mirror: false, // Never hide/disappear when scrolling past
      offset: 30,
      delay: 0,
      disableMutationObserver: false, // Must be false so React dynamically mounted components are detected!
    });

    // Staggered refreshes to catch async React tree mounts & CMS data arrivals
    const t1 = setTimeout(() => AOS.refresh(), 100);
    const t2 = setTimeout(() => AOS.refresh(), 400);
    const t3 = setTimeout(() => AOS.refresh(), 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    // Refresh AOS whenever route changes to bind newly mounted elements
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}

export default AosManager;
