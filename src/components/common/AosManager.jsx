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
      duration: isMobile ? 600 : 750,
      easing: "ease-out-cubic",
      once: true, // Animates on scroll down and stays visible permanently
      mirror: false, // Never hide/disappear when scrolling past
      offset: isMobile ? 30 : 50,
      delay: 0,
      disableMutationObserver: true,
    });
  }, []);

  useEffect(() => {
    // Refresh AOS whenever route changes to bind newly mounted elements
    const timer = setTimeout(() => {
      AOS.refreshHard();
    }, 120);

    const timer2 = setTimeout(() => {
      AOS.refresh();
    }, 350);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [pathname, search]);

  return null;
}

export default AosManager;
