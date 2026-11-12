"use client";

import { useEffect } from "react";
import { useMemeStore } from "@/lib/store";
import { trackPageView } from "@/lib/analytics";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks, { UniqueFeatures, TrustRow } from "@/components/home/HowItWorks";
import { PopularTemplates, PopularCategories, SocialFormats } from "@/components/home/Sections";
import { TrendingMarquee } from "@/components/home/TrendingMarquee";
import FAQ from "@/components/home/FAQ";
import MemeEditor from "@/components/editor/MemeEditor";
import TemplateLibrary from "@/components/templates/TemplateLibrary";
import TrendingMemes from "@/components/trending/TrendingMemes";
import BatchCreator from "@/components/batch/BatchCreator";
import LandingPage from "@/components/landing/LandingPage";
import GuideView from "@/components/landing/GuideView";
import { About, Privacy } from "@/components/common/Misc";

export default function Home() {
  const view = useMemeStore((s) => s.view);
  const viewParams = useMemeStore((s) => s.viewParams);

  // Sync hash on view change for shareability
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = `#${view}${Object.entries(viewParams).map(([k, v]) => `/${k}=${encodeURIComponent(v)}`).join("")}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    trackPageView(view);
  }, [view, viewParams]);

  // Read initial view from hash on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parseHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const [viewPart, ...rest] = raw.split("/");
      const validViews = ["home", "editor", "templates", "trending", "batch", "guides", "guide", "landing", "about", "privacy"];
      if (validViews.includes(viewPart)) {
        const params: Record<string, string> = {};
        for (const part of rest) {
          const [k, ...v] = part.split("=");
          if (k) params[k] = decodeURIComponent(v.join("="));
        }
        useMemeStore.setState({ view: viewPart as any, viewParams: params });
      }
    };
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, []);

  const isEditor = view === "editor";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className={`flex-1 flex flex-col ${isEditor ? "min-h-0" : ""}`}>
        {view === "home" && (
          <>
            <Hero />
            <TrendingMarquee />
            <TrustRow />
            <HowItWorks />
            <PopularTemplates />
            <UniqueFeatures />
            <SocialFormats />
            <PopularCategories />
            <FAQ />
          </>
        )}
        {isEditor && (
          <div className="flex-1 min-h-0 flex flex-col">
            <MemeEditor />
          </div>
        )}
        {view === "templates" && (
          <TemplateLibrary initialCategory={viewParams.category} />
        )}
        {view === "trending" && <TrendingMemes />}
        {view === "batch" && <BatchCreator />}
        {view === "landing" && <LandingPage slug={viewParams.page || ""} />}
        {view === "guides" && <GuideView />}
        {view === "guide" && <GuideView slug={viewParams.slug} />}
        {view === "about" && <About />}
        {view === "privacy" && <Privacy />}
      </main>
      <Footer />
    </div>
  );
}
