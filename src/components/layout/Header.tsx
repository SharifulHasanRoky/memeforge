"use client";

import { useEffect, useRef, useState } from "react";
import { useMemeStore } from "@/lib/store";
import { trackCreateMeme, trackPageView } from "@/lib/analytics";
import type { TrendingData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Menu, Hammer, X, Flame, ChevronDown, Sparkles, Wand2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  label: string;
  view: any;
  params?: Record<string, string>;
  desc?: string;
  icon?: any;
}

const TOOLS: NavLink[] = [
  { label: "Meme Generator", view: "landing", params: { page: "meme-generator" }, desc: "The main tool — make any meme", icon: Wand2 },
  { label: "Multi-Panel Maker", view: "landing", params: { page: "multi-panel-meme-maker" }, desc: "2-, 3-, 4-panel layouts", icon: Sparkles },
  { label: "Instagram Maker", view: "landing", params: { page: "instagram-meme-maker" }, desc: "Square, portrait, story", icon: Sparkles },
  { label: "WhatsApp Maker", view: "landing", params: { page: "whatsapp-meme-maker" }, desc: "Square share format", icon: Sparkles },
  { label: "GIF Meme Maker", view: "landing", params: { page: "gif-meme-maker" }, desc: "Animated GIF captions", icon: Sparkles },
  { label: "Custom Meme Maker", view: "landing", params: { page: "custom-meme-maker" }, desc: "Build fully from scratch", icon: Sparkles },
];

const GUIDES: NavLink[] = [
  { label: "How to Make a Meme", view: "guide", params: { slug: "how-to-make-a-meme" } },
  { label: "Add Text to a Meme", view: "guide", params: { slug: "how-to-add-text-to-a-meme" } },
  { label: "Two-Panel Meme", view: "guide", params: { slug: "how-to-make-a-two-panel-meme" } },
  { label: "Resize for Instagram", view: "guide", params: { slug: "how-to-resize-memes-for-instagram" } },
  { label: "Create GIF Memes", view: "guide", params: { slug: "how-to-create-gif-memes" } },
];

export default function Header() {
  const view = useMemeStore((s) => s.view);
  const setView = useMemeStore((s) => s.setView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<any>(null);

  useEffect(() => {
    trackPageView(view);
  }, [view]);

  // Lazy-load trending previews when the mega menu is opened for the first time
  useEffect(() => {
    if (megaOpen && !trending) {
      fetch("/api/trending", { signal: AbortSignal.timeout(12000) })
        .then((r) => r.json())
        .then((d) => setTrending(d))
        .catch(() => {});
    }
  }, [megaOpen, trending]);

  // Close mega on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const nav = (item: NavLink) => {
    if (item.params) useMemeStore.setState({ viewParams: item.params });
    setView(item.view);
    setMegaOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <button onClick={() => setView("home")} className="flex items-center gap-2 font-extrabold text-lg tracking-tight shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-sm">
            <Hammer className="w-4 h-4" />
          </span>
          <span>MemeForge</span>
        </button>
        <span className="hidden sm:inline text-xs text-muted-foreground ml-1">Meme Generator</span>

        <nav className="hidden md:flex items-center gap-0.5 ml-4">
          {/* Editor */}
          <button
            onClick={() => setView("editor")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${view === "editor" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
          >
            Editor
          </button>

          {/* Templates */}
          <button
            onClick={() => setView("templates")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${view === "templates" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
          >
            Templates
          </button>

          {/* Trending — featured */}
          <button
            onClick={() => setView("trending")}
            className={`px-3 py-1.5 rounded-md text-sm transition inline-flex items-center gap-1.5 relative ${view === "trending" ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium" : "hover:bg-muted text-foreground"}`}
          >
            <Flame className="w-3.5 h-3.5" />
            Trending
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {/* Mega menu trigger */}
          <div className="relative" ref={megaRef}>
            <button
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={() => { clearTimeout(megaTimer.current); setMegaOpen(true); }}
              onMouseLeave={() => { megaTimer.current = setTimeout(() => setMegaOpen(false), 300); }}
              className={`px-3 py-1.5 rounded-md text-sm transition inline-flex items-center gap-1 ${megaOpen ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            >
              Tools & Guides
              <ChevronDown className={`w-3.5 h-3.5 transition ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega menu panel */}
            {megaOpen && (
              <div
                onMouseEnter={() => clearTimeout(megaTimer.current)}
                onMouseLeave={() => { megaTimer.current = setTimeout(() => setMegaOpen(false), 300); }
                }
                className="absolute top-full left-0 mt-1 w-[680px] max-w-[calc(100vw-2rem)] bg-card border rounded-xl shadow-2xl grid grid-cols-3 gap-0 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Column 1: Tools */}
                <div className="p-4 border-r">
                  <div className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" /> Tools
                  </div>
                  <div className="space-y-0.5">
                    {TOOLS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => nav(t)}
                        className="block w-full text-left px-2 py-2 rounded-md hover:bg-muted transition group"
                      >
                        <div className="text-sm font-medium group-hover:text-primary">{t.label}</div>
                        {t.desc && <div className="text-[10px] text-muted-foreground">{t.desc}</div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Guides */}
                <div className="p-4 border-r">
                  <div className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Guides
                  </div>
                  <div className="space-y-0.5">
                    {GUIDES.map((g) => (
                      <button
                        key={g.label}
                        onClick={() => nav(g)}
                        className="block w-full text-left px-2 py-2 rounded-md hover:bg-muted transition group"
                      >
                        <div className="text-sm font-medium group-hover:text-primary">{g.label}</div>
                      </button>
                    ))}
                    <div className="pt-2 mt-2 border-t space-y-0.5">
                      <button onClick={() => nav({ label: "All Templates", view: "templates" })} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition text-sm font-medium hover:text-primary">
                        All Templates →
                      </button>
                      <button onClick={() => nav({ label: "About", view: "about" })} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition text-sm font-medium hover:text-primary">
                        About
                      </button>
                      <button onClick={() => nav({ label: "Privacy", view: "privacy" })} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition text-sm font-medium hover:text-primary">
                        Privacy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Live trending */}
                <div className="p-4 bg-gradient-to-b from-amber-50/50 to-pink-50/50 dark:from-amber-950/20 dark:to-pink-950/20">
                  <button
                    onClick={() => nav({ label: "Trending", view: "trending" })}
                    className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5 w-full hover:text-primary"
                  >
                    <Flame className="w-3.5 h-3.5" /> 🔥 Trending now
                    <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">LIVE</span>
                  </button>
                  <div className="grid grid-cols-3 gap-1.5">
                    {!trending && Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
                    ))}
                    {trending && trending.memes.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => nav({ label: "Trending", view: "trending" })}
                        className="aspect-square rounded-md overflow-hidden border bg-muted hover:border-primary hover:scale-105 transition relative group"
                        title={m.title}
                      >
                        <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                      </button>
                    ))}
                  </div>
                  {trending && trending.trending.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Topics</div>
                      <div className="flex flex-wrap gap-1">
                        {trending.trending.slice(0, 4).map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-card border truncate max-w-[100px]" title={t}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full mt-3 gap-1.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90"
                    onClick={() => nav({ label: "Trending", view: "trending" })}
                  >
                    <Flame className="w-3.5 h-3.5" /> See all trending
                  </Button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setView("batch")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${view === "batch" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
          >
            Batch
          </button>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button size="sm" className="hidden sm:flex gap-1.5" onClick={() => { trackCreateMeme(); setView("editor"); }}>
            Create a Meme
          </Button>
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto scrollbar-thin">
          <button onClick={() => { setView("editor"); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm">Editor</button>
          <button onClick={() => { setView("templates"); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm">Templates</button>
          <button onClick={() => { setView("trending"); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm font-medium text-primary">
            <span className="inline-flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Trending Memes</span>
          </button>
          <button onClick={() => { setView("batch"); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm">Batch Creator</button>
          <div className="pt-2 mt-2 border-t text-xs font-semibold uppercase text-muted-foreground px-3">Tools</div>
          {TOOLS.map((t) => (
            <button key={t.label} onClick={() => nav(t)} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm">{t.label}</button>
          ))}
          <div className="pt-2 mt-2 border-t text-xs font-semibold uppercase text-muted-foreground px-3">Guides</div>
          {GUIDES.map((g) => (
            <button key={g.label} onClick={() => nav(g)} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm">{g.label}</button>
          ))}
          <div className="pt-2 mt-2 border-t">
            <Button size="sm" className="w-full" onClick={() => { setView("editor"); setMobileOpen(false); }}>Create a Meme</Button>
          </div>
        </div>
      )}
    </header>
  );
}
