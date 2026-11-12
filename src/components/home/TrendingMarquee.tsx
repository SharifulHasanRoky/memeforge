"use client";

import { useEffect, useState } from "react";
import { useMemeStore } from "@/lib/store";
import type { TrendingData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, ArrowRight, Loader2 } from "lucide-react";

export function TrendingMarquee() {
  const setView = useMemeStore((s) => s.setView);
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending", { signal: AbortSignal.timeout(10000) })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const memes = data?.memes || [];
  // Duplicate the list so the marquee can scroll continuously
  const looped = [...memes, ...memes];

  return (
    <section className="py-12 sm:py-16 border-b bg-gradient-to-b from-amber-50/30 to-violet-50/30 dark:from-amber-950/10 dark:to-violet-950/10">
      <div className="container mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-medium mb-3">
              <Flame className="w-3.5 h-3.5" /> Live from social media
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Trending memes right now</h2>
            <p className="text-muted-foreground mt-2">
              Real viral formats pulled from Imgflip&apos;s top-100 most-captioned templates. Click any to remix in seconds.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setView("trending")}>
            See all trending <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden px-4 sm:px-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl shrink-0" />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* Edge gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-3 marquee-scroll px-4 sm:px-6" style={{ animation: "marquee 60s linear infinite" }}>
            {looped.map((m, i) => (
              <button
                key={`${m.id}-${i}`}
                onClick={() => setView("trending")}
                className="group relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border bg-card hover:border-primary hover:shadow-lg transition shrink-0"
              >
                <img
                  src={m.imageUrl}
                  alt={`${m.title} trending meme`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                  <div className="text-[10px] text-white font-medium truncate w-full">{m.title}</div>
                </div>
                {i < 5 && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[9px] font-bold">
                    #{i + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
