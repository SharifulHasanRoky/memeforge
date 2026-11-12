"use client";

import { useMemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MousePointerClick, Type, LayoutGrid, Download, Sparkles, ShieldCheck, Smartphone } from "lucide-react";

const STEPS = [
  { icon: MousePointerClick, title: "Pick a template or upload", body: "Start from a clean canvas, an original MemeForge template, or drag in your own JPG, PNG, or WebP." },
  { icon: Type, title: "Add and style text", body: "Drag, resize, and rotate text. Pick Impact, Inter, serif, mono, or handwritten fonts. Add outlines, shadows, and backgrounds." },
  { icon: LayoutGrid, title: "Multi-panel & resize", body: "Build two-, three-, or four-panel memes. Resize the whole meme to Instagram, TikTok, X, or YouTube in one click." },
  { icon: Download, title: "Download watermark-free", body: "Export PNG, JPG, or WebP. No watermark. No forced signup. Your meme is yours the moment you make it." },
];

export default function HowItWorks() {
  const setView = useMemeStore((s) => s.setView);
  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-medium mb-3">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From blank canvas to viral-ready in 4 steps</h2>
          <p className="text-muted-foreground mt-3">No accounts. No paywalls. Just open the editor and start creating.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <Card key={i} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-4 right-5 text-5xl font-black text-violet-100 select-none">{i + 1}</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button size="lg" className="gap-2" onClick={() => setView("editor")}>
            <Sparkles className="w-4 h-4" /> Start creating now
          </Button>
        </div>
      </div>
    </section>
  );
}

export function UniqueFeatures() {
  return (
    <section className="py-16 sm:py-20 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mb-3">
            Why MemeForge is different
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">A real editing experience, not another clone</h2>
          <p className="text-muted-foreground mt-3">Three features you won&apos;t find bundled together in most free meme generators.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-5xl">
              📐
            </div>
            <CardContent className="pt-5">
              <h3 className="font-semibold text-lg mb-1.5">Platform-ready resizing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One click adapts your meme to Instagram square, portrait, story, TikTok vertical, YouTube thumbnail, X post, or WhatsApp. Text stays readable — you can reposition anything afterward.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-5xl">
              🧩
            </div>
            <CardContent className="pt-5">
              <h3 className="font-semibold text-lg mb-1.5">Multi-panel memes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build two-panel comparisons, three-panel strips, four-panel grids, before/after, and expectation/reality memes. Drop a different image into each panel.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-5xl">
              📦
            </div>
            <CardContent className="pt-5">
              <h3 className="font-semibold text-lg mb-1.5">Batch meme generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paste a list of captions and generate ten variations of the same meme in one go. Preview, download individually, or grab them all as a ZIP.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function TrustRow() {
  return (
    <section className="py-10 bg-card border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: ShieldCheck, label: "Privacy-first local editing" },
            { icon: Smartphone, label: "Mobile & desktop" },
            { icon: Download, label: "Watermark-free export" },
            { icon: Type, label: "10+ fonts, full styling" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
