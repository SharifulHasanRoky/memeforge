"use client";

import { useMemeStore } from "@/lib/store";
import { clearAnalytics, computeMetrics, setAnalyticsEnabled, analyticsEnabled } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Heart, Shield, Sparkles } from "lucide-react";

export function About() {
  const setView = useMemeStore((s) => s.setView);
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">About MemeForge</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
        <p>
          MemeForge is a free online meme generator that lets you create memes from templates or uploaded images,
          add customizable text, build multi-panel memes, resize content for social platforms, and download
          watermark-free images without signing up. The editor works in your browser; your uploaded images stay
          on your device for ordinary editing.
        </p>
        <p>
          We built MemeForge because most free meme generators stop at "pick a template, add top and bottom text".
          Real meme creation needs more: rotation handles, multi-panel layouts, platform-aware resizing, batch
          generation, and a quality checker that catches readability problems before you post. All of that is
          here, and the core is free forever.
        </p>
        <p>
          We do not host copyrighted character imagery. Every template in our library is an original layout built
          from shapes and text zones. You bring your own photos and screenshots; you stay responsible for the
          rights to images you upload.
        </p>
        <p>
          MemeForge is for creators — students making study memes, marketers making brand humor, gamers, sports
          fans, pet owners, couples, and anyone with a punchline. Make a meme, download it, share it. That&apos;s
          the whole product.
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Button className="gap-2" onClick={() => setView("editor")}>
          <Sparkles className="w-4 h-4" /> Start creating
        </Button>
        <Button variant="outline" onClick={() => setView("privacy")}>
          <Shield className="w-4 h-4" /> Privacy policy
        </Button>
      </div>
    </div>
  );
}

export function Privacy() {
  const setView = useMemeStore((s) => s.setView);
  const [enabled, setEnabled] = useState(true);
  const [metrics, setMetrics] = useState(() => computeMetrics());

  // Read initial state on mount without triggering cascading renders
  useEffect(() => {
    let mounted = true;
    const e = analyticsEnabled();
    const m = computeMetrics();
    // Defer to next tick so initial state already settled
    Promise.resolve().then(() => {
      if (!mounted) return;
      setEnabled(e);
      setMetrics(m);
    });
    return () => { mounted = false; };
  }, []);

  const handleClear = () => {
    clearAnalytics();
    setMetrics(computeMetrics());
    toast.success("Analytics history cleared");
  };

  const handleToggle = (v: boolean) => {
    setAnalyticsEnabled(v);
    setEnabled(v);
    toast.success(v ? "Privacy-conscious analytics enabled" : "Analytics disabled");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy</h1>

      <Card className="mb-6">
        <CardContent className="pt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="font-semibold text-foreground mb-1.5">In-browser editing</h2>
            <p>
              When you upload an image to MemeForge, it is processed in your browser using the Canvas API.
              We do not send your uploaded images to our servers for ordinary editing, and we do not store
              uploaded images permanently. When you close the tab, your upload is gone.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1.5">Local storage</h2>
            <p>
              We use your browser&apos;s local storage to remember your last editing session and recently
              used templates. This data stays in your browser. We never send it to our servers. You can
              clear your session at any time from the editor (Reset) or from your browser&apos;s site-data settings.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1.5">AI caption assistant</h2>
            <p>
              The optional AI caption assistant sends your tone selection and the optional text context you
              type to our backend. It does <strong>not</strong> send your image. The backend uses the Z.ai
              language model to generate caption suggestions. The assistant is optional — the editor works
              fully without AI, and a deterministic fallback is provided if the AI service is unavailable.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1.5">Analytics</h2>
            <p>
              MemeForge uses privacy-conscious, local-only analytics. Events (page views, template selections,
              exports, errors) are stored in your browser&apos;s local storage. We do not use third-party
              tracking pixels or send your analytics to external services. You can disable analytics and
              clear your history below.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1.5">Copyright</h2>
            <p>
              You are responsible for the rights to images you upload. We do not host copyrighted character
              imagery in our template library. We provide a copyright and takedown process for any
              unauthorized use of templates or assets we host.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-5 space-y-4">
          <h2 className="font-semibold">Your analytics</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Privacy-conscious analytics</div>
              <div className="text-xs text-muted-foreground">Local-only event counting. No third-party tracking.</div>
            </div>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Stat label="Page views" value={metrics.pageViews} />
            <Stat label="Meme exports" value={metrics.exportSuccesses} />
            <Stat label="Template picks" value={metrics.templateSelections} />
          </div>
          <Button variant="outline" size="sm" onClick={handleClear}>Clear analytics history</Button>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => setView("home")}>Back to home</Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
