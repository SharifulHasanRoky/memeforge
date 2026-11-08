"use client";

import { useEffect, useState } from "react";
import { useMemeStore } from "@/lib/store";
import { trackCreateMeme, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Menu, Hammer, X } from "lucide-react";

const NAV = [
  { label: "Editor", view: "editor" as const },
  { label: "Templates", view: "templates" as const },
  { label: "Batch", view: "batch" as const },
  { label: "Guides", view: "guides" as const },
  { label: "Landing pages", view: "landing" as const },
];

export default function Header() {
  const view = useMemeStore((s) => s.view);
  const setView = useMemeStore((s) => s.setView);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    trackPageView(view);
  }, [view]);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <button onClick={() => setView("home")} className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Hammer className="w-4 h-4" />
          </span>
          <span>MemeForge</span>
        </button>
        <span className="hidden sm:inline text-xs text-muted-foreground ml-1">Meme Generator</span>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV.map((n) => (
            <button
              key={n.view}
              onClick={() => setView(n.view)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${view === n.view ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <Button size="sm" className="hidden sm:flex gap-1.5" onClick={() => { trackCreateMeme(); setView("editor"); }}>
          Create a Meme
        </Button>
        <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.view}
              onClick={() => { setView(n.view); setMobileOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
            >
              {n.label}
            </button>
          ))}
          <Button size="sm" className="w-full mt-2" onClick={() => { setView("editor"); setMobileOpen(false); }}>
            Create a Meme
          </Button>
        </div>
      )}
    </header>
  );
}
