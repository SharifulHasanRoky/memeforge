"use client";

import { useEffect, useState } from "react";
import { useMemeStore } from "@/lib/store";
import { trackTemplateSelect, trackPageView } from "@/lib/analytics";
import type { TrendingData, TrendingMeme } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Flame,
  Search,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Wand2,
  Loader2,
  Filter,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

export default function TrendingMemes() {
  const setView = useMemeStore((s) => s.setView);
  const loadTrendingMeme = useMemeStore((s) => s.loadTrendingMeme);
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "imgflip" | "web">("all");
  const [remixing, setRemixing] = useState<string | null>(null);

  const fetchTrending = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trending${force ? "?force=1" : ""}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error("Failed to fetch trending memes");
      const json = await res.json();
      setData(json);
      trackPageView("trending");
    } catch (e: any) {
      setError(e?.message || "Couldn't load trending memes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const filtered = (data?.memes || []).filter((m) => {
    if (sourceFilter !== "all" && m.source !== sourceFilter) return false;
    if (!search.trim()) return true;
    return m.title.toLowerCase().includes(search.toLowerCase());
  });

  const handleRemix = async (m: TrendingMeme) => {
    setRemixing(m.id);
    try {
      await loadTrendingMeme({ imageUrl: m.imageUrl, title: m.title, width: m.width, height: m.height });
      trackTemplateSelect(`trending:${m.id}`);
      setView("editor");
      toast.success(`Loaded "${m.title}" — add your text!`);
    } catch (e) {
      toast.error("Couldn't load this meme. Try another one.");
    } finally {
      setRemixing(null);
    }
  };

  return (
    <div className="relative">
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-violet-600 via-pink-500 to-amber-500 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-medium border border-white/30">
                <Flame className="w-3.5 h-3.5" /> Live trending · Updated every 30 min
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" /> Trending Memes
              </h1>
              <p className="text-white/90 text-base sm:text-lg">
                Real viral meme formats pulled live from Imgflip&apos;s top-100 most-captioned templates, plus fresh context from web search. Pick one, add your caption, download — no signup.
              </p>
              {data?.sources && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                    <ImageIcon className="w-3 h-3 mr-1" /> {data.sources.imgflip} Imgflip
                  </Badge>
                  {data.sources.web > 0 && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                      <Sparkles className="w-3 h-3 mr-1" /> {data.sources.web} Web
                    </Badge>
                  )}
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                    {data.memes.length} total
                  </Badge>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              className="gap-2 self-start lg:self-end"
              onClick={() => fetchTrending(true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh feed
            </Button>
          </div>
        </div>
      </section>

      {/* Trending topics ribbon */}
      {data?.trending && data.trending.length > 0 && (
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <div className="text-xs font-semibold uppercase text-muted-foreground shrink-0">🔥 What&apos;s trending now:</div>
              {data.trending.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-card border text-xs whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trending memes by name"
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5">
            <Button variant={sourceFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setSourceFilter("all")} className="gap-1.5">
              <Filter className="w-3.5 h-3.5" /> All
            </Button>
            <Button variant={sourceFilter === "imgflip" ? "default" : "outline"} size="sm" onClick={() => setSourceFilter("imgflip")}>
              Imgflip
            </Button>
            <Button variant={sourceFilter === "web" ? "default" : "outline"} size="sm" onClick={() => setSourceFilter("web")}>
              Web
            </Button>
          </div>
        </div>

        {/* States */}
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-3">
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <Button onClick={() => fetchTrending(true)} className="gap-2"><RefreshCw className="w-4 h-4" /> Try again</Button>
          </div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Flame className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No trending memes match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((m, i) => (
                  <TrendingCard
                    key={m.id}
                    meme={m}
                    rank={i + 1}
                    onRemix={() => handleRemix(m)}
                    remixing={remixing === m.id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t text-xs text-muted-foreground max-w-3xl space-y-1">
          <p>
            <strong>How this works:</strong> Trending data is pulled live from Imgflip&apos;s public <code>get_memes</code> endpoint (top 100 most-captioned meme templates) and enriched with text context from Z.ai. Results are cached for 30 minutes to stay fast.
          </p>
          <p>
            <strong>Remixing:</strong> Click any trending meme to load it into the editor with a default top/bottom text overlay. You can move, resize, restyle, or delete any layer. MemeForge does not host the original images — they are loaded directly from their public source URLs.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendingCard({
  meme,
  rank,
  onRemix,
  remixing,
}: {
  meme: TrendingMeme;
  rank: number;
  onRemix: () => void;
  remixing: boolean;
}) {
  const isHot = rank <= 5 && (meme.captions || 0) > 100000;
  return (
    <div className="group relative rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-xl transition-all">
      <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-black/70 backdrop-blur text-white text-xs font-bold flex items-center justify-center">
        #{rank}
      </div>
      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-white text-[10px] font-medium uppercase tracking-wide">
        {meme.source === "imgflip" ? "🔥 Imgflip" : "🌐 Web"}
      </div>
      {isHot && (
        <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[10px] font-bold flex items-center gap-1">
          <Flame className="w-2.5 h-2.5" /> HOT
        </div>
      )}
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={meme.imageUrl}
          alt={`${meme.title} — trending meme template`}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
          <Button
            size="sm"
            className="w-full gap-1.5"
            onClick={onRemix}
            disabled={remixing}
          >
            {remixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {remixing ? "Loading…" : "Remix this meme"}
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="font-medium text-sm truncate" title={meme.title}>{meme.title}</div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>
            {meme.captions ? `${(meme.captions / 1000).toFixed(0)}k captions` : meme.source === "web" ? "web pick" : "—"}
          </span>
          {meme.url && (
            <a
              href={meme.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:text-primary inline-flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
              aria-label="View source"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
