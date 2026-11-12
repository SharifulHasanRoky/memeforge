"use client";

import { useMemeStore } from "@/lib/store";
import { trackCreateMeme, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wand2, Layers, Image as ImageIcon, Download, MousePointerClick, Flame, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const setView = useMemeStore((s) => s.setView);

  useEffect(() => {
    trackPageView("/");
  }, []);

  return (
    <section className="relative overflow-hidden border-b">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-white to-amber-50 dark:from-violet-950/30 dark:via-background dark:to-amber-950/20" />
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-violet-300 dark:bg-violet-700 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-amber-300 dark:bg-amber-700 blur-3xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "1s" }} />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-pink-300 dark:bg-pink-700 blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "2s" }} />
      </div>

      {/* Floating decorative meme chips */}
      <FloatingChips />

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200 text-xs font-medium border border-violet-200 dark:border-violet-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
              </span>
              100% free · No signup · No watermark
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.02]">
              Create Memes in <br />
              <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">Seconds</span>. <span className="text-foreground">Completely Free.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Make funny memes, customize templates, upload your own images, and download high-quality memes. No signup. No watermark. Works on mobile and desktop.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="text-base h-12 px-7 gap-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 shadow-lg shadow-violet-500/25" onClick={() => { trackCreateMeme(); setView("editor"); }}>
                <Wand2 className="w-5 h-5" /> Create a Meme
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-7 gap-2 bg-background/80 backdrop-blur" onClick={() => setView("trending")}>
                <Flame className="w-4 h-4 text-orange-500" /> Trending Memes <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Upload your own image</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Multi-panel memes</span>
              <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> PNG · JPG · WebP</span>
              <span className="inline-flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" /> Drag · resize · rotate</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI captions</span>
            </div>
          </div>

          {/* Hero preview */}
          <div className="relative">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingChips() {
  // Small floating meme-style chips around the hero — pure decorative
  const chips = [
    { text: "POV:", x: "8%", y: "20%", rot: -6, color: "from-violet-500 to-pink-500" },
    { text: "It me.", x: "85%", y: "15%", rot: 5, color: "from-amber-500 to-orange-500" },
    { text: "Not me...", x: "5%", y: "70%", rot: 3, color: "from-pink-500 to-violet-500" },
    { text: "When bug", x: "88%", y: "75%", rot: -4, color: "from-cyan-500 to-violet-500" },
  ];
  return (
    <div className="absolute inset-0 -z-5 pointer-events-none hidden lg:block">
      {chips.map((c, i) => (
        <div
          key={i}
          className="absolute px-3 py-1.5 rounded-lg bg-white/80 dark:bg-card/80 backdrop-blur shadow-lg border text-sm font-bold animate-bounce"
          style={{
            left: c.x,
            top: c.y,
            transform: `rotate(${c.rot}deg)`,
            animationDuration: "4s",
            animationDelay: `${i * 0.3}s`,
            animationIterationCount: "infinite",
          }}
        >
          <span className={`bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{c.text}</span>
        </div>
      ))}
    </div>
  );
}

function HeroPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  const captions = [
    { top: "WHEN THE BUILD FINALLY PASSES", bottom: "AFTER 47 RETRIES" },
    { top: "ME EXPLAINING THE BUG", bottom: "THAT I CREATED" },
    { top: "POV: IT'S MONDAY", bottom: "AND COFFEE ISN'T ENOUGH" },
    { top: "WHEN PROD WORKS", bottom: "ON MY MACHINE ONLY" },
  ];
  const cap = captions[tick % captions.length];

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-white dark:bg-card shadow-2xl ring-1 ring-border/50 overflow-hidden">
        {/* Editor top bar */}
        <div className="h-9 bg-violet-50 dark:bg-violet-950/40 border-b border-violet-100 dark:border-violet-900 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-auto text-[10px] text-muted-foreground font-mono">memeforge / editor</div>
        </div>
        {/* Canvas */}
        <div className="relative p-4">
          <div className="aspect-square rounded-md bg-gradient-to-br from-violet-600 to-pink-500 relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-x-4 top-4 text-white text-3xl font-extrabold text-center leading-tight transition-all duration-500" style={{ fontFamily: "Impact, Arial Black, sans-serif", textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}>
              {cap.top}
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white text-2xl font-extrabold text-center transition-all duration-500" style={{ fontFamily: "Impact, Arial Black, sans-serif", textShadow: "2px 2px 0 #000" }}>
              {cap.bottom}
            </div>
            {/* Selection box mock */}
            <div className="absolute inset-x-4 bottom-4 border-2 border-violet-400 rounded pointer-events-none transition-all" style={{ height: "60px" }}>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-violet-500" />
            </div>
            {/* Pulsing cursor */}
            <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-violet-400 animate-pulse" style={{ transform: "translate(-50%, -50%)" }} />
          </div>
        </div>
        {/* Floating action badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="px-2 py-1 rounded bg-background/80 backdrop-blur border">1080×1080</span>
          <span className="px-2 py-1 rounded bg-background/80 backdrop-blur border">PNG ready</span>
        </div>
      </div>
      {/* Floating badges */}
      <div className="absolute -top-3 -right-3 bg-white dark:bg-card rounded-lg shadow-lg px-3 py-2 text-xs font-semibold border rotate-3">
        <span className="text-primary">PNG</span> export ready
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-lg shadow-lg px-3 py-2 text-xs font-semibold border -rotate-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Privacy-first · Local processing
      </div>
    </div>
  );
}
