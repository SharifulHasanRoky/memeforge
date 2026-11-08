"use client";

import { useState, useMemo } from "react";
import { useMemeStore } from "@/lib/store";
import { TEMPLATES, templateThumbnail } from "@/lib/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/presets";
import { trackTemplateSelect } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, LayoutGrid, X } from "lucide-react";

export default function TemplateLibrary({ initialCategory }: { initialCategory?: string }) {
  const loadTemplate = useMemeStore((s) => s.loadTemplate);
  const setView = useMemeStore((s) => s.setView);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(initialCategory || "");

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      // Match if ALL whitespace-separated terms appear somewhere in name+desc+keywords
      const terms = q.split(/\s+/);
      const haystack = `${t.name} ${t.description} ${t.keywords.join(" ")}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [search, cat]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Meme templates</h1>
        <p className="text-muted-foreground mt-1">
          {TEMPLATES.length} original layouts. Pick one and start editing — no signup, no watermark.
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or keyword — try 'two panel', 'cat', 'marketing'"
          className="pl-10"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setCat("")}
          className={`px-3 py-1.5 text-xs rounded-md border transition ${cat === "" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-3 py-1.5 text-xs rounded-md border transition ${cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((t) => (
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
                alt={`${t.name} meme template — ${t.category}`}
                className="w-full h-full object-contain group-hover:scale-105 transition"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="font-medium text-sm truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.name || t.category}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {t.panels} panel · {t.width}×{t.height}
              </div>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates match your search. Try a different keyword or category.</p>
        </div>
      )}
    </div>
  );
}
