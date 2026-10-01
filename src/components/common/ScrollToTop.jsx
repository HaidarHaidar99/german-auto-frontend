import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Ensure browser does not remember and restore previous scroll positions across route changes
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function forceScrollTop() {
  if (typeof window === "undefined") return;

  // 1. Sync Lenis smooth scroll engine if active
  if (window.__lenis && typeof window.__lenis.scrollTo === "function") {
    try {
      window.__lenis.scrollTo(0, { immediate: true });
    } catch {}
  }

  // 2. Window and document root resets
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
  }

  // 3. Reset main layout and scrollable containers if any
  const scrollContainers = document.querySelectorAll(
    "main, .public-layout, .auth-page-centered, .admin-main-viewport, #root"
  );
  scrollContainers.forEach((el) => {
    if (el && el.scrollTop > 0) {
      el.scrollTop = 0;
    }
  });
}

/**
 * Universal ScrollToTop component
 * Automatically forces window, Lenis, and document root to the absolute top (0, 0)
 * on any page navigation, form opening, or route change across the entire website.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Immediate synchronous reset only when route changes
    forceScrollTop();
  }, [pathname]);

  return null;
}

export default ScrollToTop;
