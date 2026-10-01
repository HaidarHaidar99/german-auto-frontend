import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import AccountHeader from "../../components/account/AccountHeader";
import AccountNav from "../../components/account/AccountNav";
import AccountProfileCard from "../../components/account/AccountProfileCard";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AccountPage() {
  const { t } = useTranslation(["account", "common"]);
  const { user } = useAuth();
  const pageContainerRef = useRef(null);

  useEffect(() => {
    document.title = `${t("navOverview")} | König Automobile Rheinberg`;
  }, [t]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".account-header", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.from(".account-nav", {
      opacity: 0,
      y: 15,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.1,
    });

    gsap.from(".account-profile-card", {
      opacity: 0,
      y: 25,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.15,
    });
  });

  return (
    <main
      ref={pageContainerRef}
      className="account-page"
      style={{
        maxWidth: "920px",
        margin: "0 auto",
        padding: "var(--space-xl) clamp(var(--space-md), 5vw, var(--space-2xl)) var(--space-4xl)",
      }}
    >
      <AccountHeader user={user} />
      <AccountNav style={{ marginBottom: "var(--space-2xl)" }} />

      <div className="account-content-area" style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        <AccountProfileCard user={user} />
      </div>
    </main>
  );
}

export default AccountPage;
