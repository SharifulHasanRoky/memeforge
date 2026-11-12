"use client";

import { useMemeStore } from "@/lib/store";
import { TEMPLATES, templateThumbnail } from "@/lib/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/presets";
import { PLATFORM_PRESETS } from "@/lib/presets";
import { trackTemplateSelect } from "@/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PopularTemplates() {
  const setView = useMemeStore((s) => s.setView);
  const loadTemplate = useMemeStore((s) => s.loadTemplate);
  // Pick a spread of templates from different categories
  const featured = [
    "blank-top-bottom",
    "two-panel-horizontal",
    "four-panel-grid",
    "expectation-reality",
    "anime-burst",
    "marketing-quote",
    "pov-work",
    "gaming-load",
  ]
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter(Boolean) as typeof TEMPLATES;

  return (
    <section className="py-16 sm:py-20 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-medium mb-3">
              Templates
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Start from a template</h2>
            <p className="text-muted-foreground mt-2">Original layouts built for the way memes actually get made. No copyrighted character images.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setView("templates")}>
            See all <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                loadTemplate(t);
                trackTemplateSelect(t.id);
                setView("editor");
              }}
              className="group text-left rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-lg transition"
            >
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={templateThumbnail(t, 320)}
                  alt={`${t.name} meme template`}
                  className="w-full h-full object-contain group-hover:scale-105 transition"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.panels} panel · {t.width}×{t.height}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularCategories() {
  const setView = useMemeStore((s) => s.setView);
  const setParams = (p: Record<string, string>) => useMemeStore.setState({ viewParams: p });
  const featured = TEMPLATE_CATEGORIES.slice(0, 12);
  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mb-3">
            Categories
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse by mood and topic</h2>
          <p className="text-muted-foreground mt-3">From classic impact memes to marketing humor and multi-panel comic strips.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featured.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setParams({ category: c.id });
                setView("templates");
              }}
              className="text-left p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SocialFormats() {
  const applyPreset = useMemeStore((s) => s.applyPlatformPreset);
  const setView = useMemeStore((s) => s.setView);
  const presets = PLATFORM_PRESETS.filter((p) => p.id !== "custom");
  return (
    <section className="py-16 sm:py-20 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-medium mb-3">
            Platform-ready
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Resize for any social platform</h2>
          <p className="text-muted-foreground mt-3">Adapt your meme to any feed without re-doing the design. Text and layers stay editable.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map((p) => {
            const ratio = p.width / p.height;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setView("editor");
                  // Apply the preset shortly after navigating to editor
                  setTimeout(() => applyPreset(p.id), 50);
                }}
                className="text-left p-3 rounded-xl border bg-card hover:border-primary hover:shadow-md transition group"
              >
                <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                  <div
                    className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-sm group-hover:scale-105 transition"
                    style={{
                      width: ratio < 1 ? `${ratio * 100}%` : "100%",
                      height: ratio >= 1 ? `${100 / ratio}%` : "100%",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  />
                </div>
                <div className="text-sm font-medium truncate">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.width}×{p.height}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
