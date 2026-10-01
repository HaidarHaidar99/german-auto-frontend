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
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      mirror: true,
      offset: 50,
      delay: 50,
      disableMutationObserver: false,
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
