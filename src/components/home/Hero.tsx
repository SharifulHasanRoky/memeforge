"use client";

import { useMemeStore } from "@/lib/store";
import { trackCreateMeme, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wand2, Layers, Image as ImageIcon, Download, MousePointerClick } from "lucide-react";
import { useEffect } from "react";

export default function Hero() {
  const setView = useMemeStore((s) => s.setView);

  useEffect(() => {
    trackPageView("/");
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white border-b">
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-violet-200 blur-3xl" />
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-amber-200 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-medium border border-violet-200">
              <Sparkles className="w-3.5 h-3.5" />
              100% free · No signup · No watermark
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Create Memes in <span className="text-primary">Seconds</span>. Completely Free.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Make funny memes, customize templates, upload your own images, and download high-quality memes. No signup. No watermark. Works on mobile and desktop.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="text-base h-12 px-7 gap-2" onClick={() => { trackCreateMeme(); setView("editor"); }}>
                <Wand2 className="w-5 h-5" /> Create a Meme
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-7 gap-2" onClick={() => setView("templates")}>
                Explore Templates <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Upload your own image</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Multi-panel memes</span>
              <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> PNG · JPG · WebP</span>
              <span className="inline-flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" /> Drag · resize · rotate</span>
            </div>
          </div>

          {/* Hero preview mock */}
          <div className="relative">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  // Static, decorative meme-like card to convey the editor experience
  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-white shadow-2xl ring-1 ring-border/50 overflow-hidden">
        {/* Faux editor top bar */}
        <div className="h-9 bg-violet-50 border-b border-violet-100 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-auto text-[10px] text-muted-foreground font-mono">memeforge / editor</div>
        </div>
        {/* Faux canvas */}
        <div className="relative p-4">
          <div className="aspect-square rounded-md bg-gradient-to-br from-violet-600 to-pink-500 relative overflow-hidden">
            <div className="absolute inset-x-4 top-4 text-white text-3xl font-extrabold text-center leading-tight" style={{ fontFamily: "Impact, Arial Black, sans-serif", textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}>
              WHEN THE BUILD<br />FINALLY PASSES
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white text-2xl font-extrabold text-center" style={{ fontFamily: "Impact, Arial Black, sans-serif", textShadow: "2px 2px 0 #000" }}>
              AFTER 47 RETRIES
            </div>
            {/* Selection box mock */}
            <div className="absolute inset-x-4 bottom-4 border-2 border-violet-400 rounded pointer-events-none" style={{ height: "60px" }}>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-violet-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-violet-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Floating badges */}
      <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-semibold border rotate-3">
        <span className="text-primary">PNG</span> export ready
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-semibold border -rotate-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500" /> Privacy-first · Local processing
      </div>
    </div>
  );
}
