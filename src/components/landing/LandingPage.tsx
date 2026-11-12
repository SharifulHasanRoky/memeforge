"use client";

import { useMemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

interface PageContent {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  hero: string;
  bullets: string[];
  body: { heading: string; text: string }[];
  faqs: { q: string; a: string }[];
}

const PAGES: Record<string, PageContent> = {
  "meme-generator": {
    slug: "meme-generator",
    title: "Free Meme Generator — Make Memes Online, No Signup | MemeForge",
    h1: "Free Meme Generator",
    metaDescription: "MemeForge is a free online meme generator. Pick a template or upload your image, add text, customize, and download watermark-free memes. No signup required.",
    hero: "Pick a template, upload your own image, or start from a blank canvas. Add your text, drag and resize it, and download a clean PNG or JPG in seconds.",
    bullets: [
      "100% free with no signup",
      "No watermark on any export",
      "Multi-panel and platform-ready resizing",
      "Works on mobile and desktop",
      "PNG, JPG, and WebP export",
    ],
    body: [
      {
        heading: "What is a meme generator?",
        text: "A meme generator is an online tool that lets you turn a blank canvas, a template, or an uploaded image into a finished meme by adding text, customizing typography, and exporting the result. MemeForge is a focused meme generator: every feature is designed around the actual flow of making a meme — pick, edit, export. There are no general image-editing distractions.",
      },
      {
        heading: "Why MemeForge is free without signup",
        text: "We believe the best meme tool is the one that's available the moment you need it. There is no account wall, no trial timer, and no daily limit on the number of memes you can create. The core editor — templates, image upload, text layers, multi-panel layouts, platform resizing, batch generation, and PNG/JPG/WebP export — is free forever. We may add optional Pro tiers later for power features, but the core editor will remain free.",
      },
      {
        heading: "How to use the meme generator",
        text: "Open the editor and either pick a template from the left sidebar, upload your own JPG/PNG/WebP image, or start from a blank canvas. Add a text layer, type your caption, then drag, resize, and rotate it. Use the right sidebar to change font, weight, color, outline, shadow, background, and alignment. Pick a platform preset to instantly resize the whole canvas to Instagram, TikTok, X, or YouTube. When you're happy, click Download and pick PNG, JPG, or WebP.",
      },
    ],
    faqs: [
      { q: "Is the meme generator really free?", a: "Yes. All core features are free with no signup. PNG, JPG, and WebP exports are watermark-free." },
      { q: "Do I need to install anything?", a: "No. MemeForge runs in your browser. It works on Chrome, Firefox, Safari, Edge, and most modern mobile browsers." },
      { q: "Can I upload my own images?", a: "Yes. JPG, PNG, and WebP up to 25 MB each. Images are processed in your browser — they don't get sent to our server for ordinary editing." },
    ],
  },
  "meme-maker": {
    slug: "meme-maker",
    title: "Meme Maker — Free Online Meme Creator | MemeForge",
    h1: "Meme Maker",
    metaDescription: "Make memes online with MemeForge. Free meme maker with templates, multi-panel layouts, custom text, and watermark-free PNG/JPG/WebP export. No signup.",
    hero: "A focused meme maker — not a generic image editor. Drag, resize, and rotate text. Build multi-panel memes. Resize for any social platform. Export in seconds.",
    bullets: [
      "10+ fonts including Impact, Inter, and serif",
      "Multi-panel: 2-up, 3-strip, 4-grid, before/after",
      "One-click platform resizing",
      "Batch creation from a list of captions",
      "Local browser processing for privacy",
    ],
    body: [
      {
        heading: "Meme maker vs meme generator",
        text: "Meme maker and meme generator are interchangeable terms. We use both so you can find the tool however you search. MemeForge is the same focused tool under either name — templates, uploads, text layers, multi-panel layouts, platform resizing, batch generation, and watermark-free export.",
      },
      {
        heading: "What makes MemeForge a maker, not a clone",
        text: "Most free meme makers copy the same template gallery and stop there. MemeForge focuses on the editing experience: rotation handles, smart auto-fit for text, contrast warnings, batch generation, and platform-aware resizing. The editor is designed to feel like a real creation tool, not a 2008-era web form.",
      },
    ],
    faqs: [
      { q: "What fonts can I use?", a: "Impact (classic), Inter (modern), Georgia (serif), Courier (mono), Comic Sans, Caveat (handwritten), plus Arial, Tahoma, Trebuchet MS, and Verdana." },
      { q: "Can I make a meme on my phone?", a: "Yes. The editor has a dedicated mobile layout with a bottom toolbar and slide-in panels. Touch-friendly handles for drag, resize, and rotate." },
      { q: "Does it work offline?", a: "The core editor works in your browser without a network. The optional AI caption assistant requires a network connection and falls back to deterministic suggestions if offline." },
    ],
  },
  "custom-meme-maker": {
    slug: "custom-meme-maker",
    title: "Custom Meme Maker — Build Memes from Scratch | MemeForge",
    h1: "Custom Meme Maker",
    metaDescription: "Build fully custom memes from your own images and text. Custom fonts, colors, outlines, multi-panel layouts, and watermark-free export. Free, no signup.",
    hero: "Skip the templates and build from scratch. Upload your own image, add multiple text layers with custom fonts, outlines, and shadows, then export.",
    bullets: [
      "Custom fonts, weights, and colors",
      "Custom outlines, shadows, and backgrounds",
      "Custom canvas dimensions (64 to 4096px)",
      "Custom multi-panel layouts",
      "Custom PNG/JPG/WebP export quality",
    ],
    body: [
      {
        heading: "When to use the custom meme maker",
        text: "Use the custom maker when no template fits your idea. Upload a screenshot, a photo of your cat, a still from your video, or any image you have the rights to. Build a two-panel comparison, a four-panel grid, or a single bold caption card. Set custom dimensions for any niche aspect ratio.",
      },
      {
        heading: "Customization you can actually use",
        text: "Every text layer exposes font, weight, size, color, outline width and color, background fill, shadow color and blur, letter spacing, line height, alignment, opacity, and rotation. Every image layer exposes object-fit, opacity, and rotation. The canvas itself has color, gradient, and transparent background modes.",
      },
    ],
    faqs: [
      { q: "Is custom export quality reduced?", a: "No. PNG exports are lossless. JPG and WebP use 92% quality by default — high enough for social sharing." },
      { q: "What's the max canvas size?", a: "Up to 4096px on either edge. Most platforms max out at 1080×1920 or 1280×720, which MemeForge handles natively via presets." },
    ],
  },
  "meme-generator-with-text": {
    slug: "meme-generator-with-text",
    title: "Meme Generator with Text — Add Text to Images | MemeForge",
    h1: "Meme Generator with Text",
    metaDescription: "Add customizable text to images and templates. Impact, modern, and handwritten fonts. Outlines, shadows, and backgrounds. Free, online, no signup.",
    hero: "Add as many text layers as you want. Style each independently — font, color, outline, shadow, background, opacity, rotation. Auto-fit text to its box in one click.",
    bullets: [
      "Multiple text layers per meme",
      "10+ fonts, custom weights and sizes",
      "Outline, shadow, and background fill",
      "Letter spacing and line height controls",
      "Auto-fit text to box with one click",
    ],
    body: [
      {
        heading: "How the text layer system works",
        text: "Each text layer is independent: its own font, size, weight, color, outline, background, shadow, opacity, and rotation. Drag from anywhere on the layer body to move it; drag a corner to resize; drag the top handle to rotate. Selection handles are touch-friendly and work the same way on mobile and desktop.",
      },
      {
        heading: "Auto-fit and readability",
        text: "Click 'Auto-fit text to box' and the editor deterministically picks the largest font size that still fits your text inside the layer's bounding box. The quality checker warns you about low contrast, text overflow, and text outside the canvas before you export.",
      },
    ],
    faqs: [
      { q: "Can I add multiple text layers?", a: "Yes. Add as many text layers as you need. Each one is independently editable and movable." },
      { q: "Can I use Impact font?", a: "Yes — Impact is the default classic meme font. Plus Inter, Georgia, Courier, Comic Sans, Caveat, and several system sans-serifs." },
    ],
  },
  "multi-panel-meme-maker": {
    slug: "multi-panel-meme-maker",
    title: "Multi-Panel Meme Maker — Two, Three, Four Panel Memes | MemeForge",
    h1: "Multi-Panel Meme Maker",
    metaDescription: "Make two-panel, three-panel, and four-panel memes. Comparison, before/after, and expectation/reality layouts. Upload a different image into each panel. Free.",
    hero: "Build comic strip memes and comparison memes with two, three, or four panels. Upload a different image into each panel. Style the captions independently.",
    bullets: [
      "Two-panel horizontal or vertical",
      "Three-panel comic strip",
      "Four-panel 2×2 grid",
      "Before/after and expectation/reality presets",
      "Custom multi-panel layouts from scratch",
    ],
    body: [
      {
        heading: "How to make a multi-panel meme",
        text: "Pick a multi-panel template from the layout tab (2-panel horizontal, 2-panel vertical, 3-panel strip, 4-panel grid, expectation/reality). Each panel is a separate area you can drop an image into. Use the upload tab to add an image per panel. Add text layers and pin them to specific panels. Reposition everything with drag, resize, and rotate.",
      },
      {
        heading: "Use cases for multi-panel memes",
        text: "Two-panel memes are great for comparisons: expectation vs reality, before vs after, me vs also me. Three-panel strips are classic comic-strip beats. Four-panel grids work for 'four moods' or 'four stages of grief' formats. Use the expectation/reality preset for labeled two-row comparisons.",
      },
    ],
    faqs: [
      { q: "Can I use a different image in each panel?", a: "Yes. Upload as many images as you need and position each one over a panel area. Use object-fit cover to fill the panel cleanly." },
      { q: "How do I label each panel?", a: "Add a text layer per panel, set its alignment and outline, then drag it to sit at the top or bottom of the panel." },
    ],
  },
  "gif-meme-maker": {
    slug: "gif-meme-maker",
    title: "GIF Meme Maker — Add Text to Animated GIFs | MemeForge",
    h1: "GIF Meme Maker",
    metaDescription: "Upload an animated GIF, add text overlays, preview, and export. MemeForge's GIF meme maker handles frame timing and text overlays. Free, online.",
    hero: "Upload an animated GIF, add text overlays, preview the animation, and export. We preserve frame timing wherever the browser permits.",
    bullets: [
      "Upload animated GIFs",
      "Add text overlays at fixed positions",
      "Preview animation in the editor",
      "Export as animated GIF",
      "Frame-timing preservation where supported",
    ],
    body: [
      {
        heading: "About GIF meme support",
        text: "GIF meme creation is on our roadmap as a Phase 3 feature. The editor can already accept GIF files as image layers (the first frame is shown as a still preview). Full animated export with preserved frame timing requires a more advanced media pipeline; we will not ship it until it works reliably. Today, the still-frame workflow is a solid way to plan your GIF meme before animating it.",
      },
      {
        heading: "Recommended workflow today",
        text: "Upload your GIF, position and style text overlays using the standard editor, and export a still PNG or JPG. You can composite the same text over the original animated GIF using any standard GIF tooling — your text design from MemeForge is reusable.",
      },
    ],
    faqs: [
      { q: "Can I export an animated GIF today?", a: "Not yet — animated GIF export is in active development. You can export a still preview PNG/JPG today and composite your text over the original GIF in any GIF tool." },
      { q: "Does it import GIFs?", a: "Yes. The first frame is used as a still preview in the editor. Full frame-by-frame editing is coming with the animated export pipeline." },
    ],
  },
  "video-meme-maker": {
    slug: "video-meme-maker",
    title: "Video Meme Maker — Add Captions to Video | MemeForge",
    h1: "Video Meme Maker",
    metaDescription: "Trim, add text captions, and export MP4 video memes. MemeForge's video meme maker is in active development. Today you can plan captions with the image editor.",
    hero: "Trim the start and end of a video, add text captions, and export an MP4. Video meme support is in active development — see what's available today.",
    bullets: [
      "Upload video and add captions",
      "Trim start and end points",
      "Persistent caption overlays",
      "MP4 export where supported",
      "Frame-accurate text placement",
    ],
    body: [
      {
        heading: "About video meme support",
        text: "Video meme creation is on our roadmap as a Phase 3 feature. The browser-native processing pipeline we use for image editing can be extended to video, but we will not ship the feature until trimming, captions, and MP4 export all work reliably across modern browsers. Today, you can use the image editor to design your captions and positioning, then export a frame to use as a poster image.",
      },
      {
        heading: "Plan your video meme today",
        text: "Pick a representative frame from your video, upload it as an image, and design your captions. The same caption text and positioning can be re-used when full video export lands. This is the same way professional meme creators design captions in tools like Premiere or CapCut.",
      },
    ],
    faqs: [
      { q: "Can I upload a video today?", a: "The image editor accepts still frames only. Video upload, trim, and MP4 export are in development." },
      { q: "When will video export ship?", a: "We will release it once the pipeline reliably handles trimming, text overlays, and MP4 export across Chrome, Firefox, Safari, and Edge." },
    ],
  },
  "instagram-meme-maker": {
    slug: "instagram-meme-maker",
    title: "Instagram Meme Maker — 1080×1080, 1080×1350, Story | MemeForge",
    h1: "Instagram Meme Maker",
    metaDescription: "Make memes sized for Instagram: square (1080×1080), portrait (1080×1350), and Story (1080×1920). One-click resize. Free, no signup, no watermark.",
    hero: "Three Instagram presets built in: square post (1080×1080), portrait post (1080×1350), and Story/Reel (1080×1920). One click adapts your existing meme.",
    bullets: [
      "Instagram square post 1080×1080",
      "Instagram portrait 1080×1350",
      "Instagram Story 1080×1920",
      "Reel-safe aspect ratios",
      "Reposition content after resizing",
    ],
    body: [
      {
        heading: "How to resize a meme for Instagram",
        text: "Open the size/layout tab in the editor and pick one of the three Instagram presets. The canvas resizes to the chosen dimensions, and existing layers scale proportionally so text stays readable. Drag any layer to reposition it for the new aspect ratio. The quality checker warns you if any text would clip on export.",
      },
      {
        heading: "Which Instagram dimension to pick",
        text: "Use the square (1080×1080) for standard feed posts. Use the portrait (1080×1350) for taller feed posts that take up more screen real estate. Use the Story (1080×1920) for vertical Stories, Reels covers, or any 9:16 destination.",
      },
    ],
    faqs: [
      { q: "Will Instagram compress my meme?", a: "Instagram always re-compresses on upload. Start from MemeForge's 1080px exports and your meme will look crisp after Instagram's compression." },
      { q: "Can I switch aspect ratios after designing?", a: "Yes. Pick a new preset and your layers will rescale. You may need to reposition some text — drag to fix and export." },
    ],
  },
  "whatsapp-meme-maker": {
    slug: "whatsapp-meme-maker",
    title: "WhatsApp Meme Maker — Square Memes for Sharing | MemeForge",
    h1: "WhatsApp Meme Maker",
    metaDescription: "Make square memes optimized for WhatsApp sharing. 1080×1080, fast export, no watermark. Free, online, no signup.",
    hero: "Square 1080×1080 memes optimized for WhatsApp sharing. Quick to make, lightweight to send, and never watermarked.",
    bullets: [
      "WhatsApp-optimized 1080×1080 square",
      "Lightweight JPG export for fast sending",
      "No watermark on any export",
      "Tamil, Hindi, Spanish — full Unicode support",
      "Mobile-first editor for sharing on the go",
    ],
    body: [
      {
        heading: "Why a square works for WhatsApp",
        text: "WhatsApp renders square images cleanly in chat previews, without cropping the punchline. MemeForge's default canvas is 1080×1080 — exactly the WhatsApp sweet spot. Export as JPG for the smallest file size, or PNG if you need a transparent background.",
      },
      {
        heading: "Sharing from your phone",
        text: "Open MemeForge on mobile, make your meme, tap Download. The image lands in your downloads folder, ready to share into any WhatsApp chat. No watermark means it looks exactly like you made it.",
      },
    ],
    faqs: [
      { q: "Can I write captions in my own language?", a: "Yes. The editor uses system fonts and the Canvas API, which support full Unicode. Some non-Latin scripts render best in Inter or Noto; test your font in the editor before exporting." },
      { q: "What's the smallest export size?", a: "JPG at 92% quality is the smallest. For a typical 1080×1080 meme, that's about 100–200 KB — perfect for WhatsApp." },
    ],
  },
};

export default function LandingPage({ slug }: { slug: string }) {
  const setView = useMemeStore((s) => s.setView);
  const page = PAGES[slug];

  useEffect(() => {
    if (page) {
      trackPageView(`/landing/${slug}`);
      document.title = page.title;
    }
  }, [slug, page]);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Landing pages</h1>
        <p className="text-muted-foreground mb-6">Pick a topic below to see a dedicated landing page with its own content.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {Object.values(PAGES).map((p) => (
            <Button key={p.slug} variant="outline" className="text-sm h-auto py-3 flex flex-col items-start gap-0.5" onClick={() => useMemeStore.setState({ viewParams: { page: p.slug } })}>
              <span className="font-medium">{p.h1}</span>
              <span className="text-xs text-muted-foreground font-normal">/{p.slug}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-violet-50 to-white border-b">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
          <nav className="text-xs text-muted-foreground mb-3">
            <button onClick={() => setView("home")} className="hover:text-primary">Home</button>
            <span className="mx-1.5">/</span>
            <button onClick={() => setView("landing")} className="hover:text-primary">Tools</button>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">{page.h1}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{page.h1}</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">{page.hero}</p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-6 max-w-2xl">
            {page.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => setView("editor")}>
              <Sparkles className="w-4 h-4" /> Open the editor
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setView("templates")}>
              Browse templates <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-10">
          {page.body.map((b, i) => (
            <div key={i}>
              <h2 className="text-2xl font-bold mb-3">{b.heading}</h2>
              <p className="text-muted-foreground leading-relaxed">{b.text}</p>
            </div>
          ))}

          <div>
            <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
            <div className="space-y-4">
              {page.faqs.map((f, i) => (
                <Card key={i}>
                  <CardContent className="pt-5">
                    <div className="font-semibold mb-1.5">{f.q}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to make your meme?</h3>
              <p className="text-muted-foreground mb-4">Free, no signup, no watermark. Open the editor and start now.</p>
              <Button size="lg" className="gap-2" onClick={() => setView("editor")}>
                <Sparkles className="w-4 h-4" /> Create a Meme
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
