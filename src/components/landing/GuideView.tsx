"use client";

import { useMemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, ArrowLeft, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

interface Guide {
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  steps: { heading: string; body: string }[];
  tip?: string;
}

const GUIDES: Record<string, Guide> = {
  "how-to-make-a-meme": {
    slug: "how-to-make-a-meme",
    title: "How to Make a Meme — Step-by-Step Guide | MemeForge",
    metaDescription: "Learn how to make a meme in under a minute. Pick a template, add text, customize, and download. Free, no signup. MemeForge guide.",
    excerpt: "A complete walkthrough of making a meme — from picking a template or uploading an image to downloading a watermark-free PNG.",
    steps: [
      { heading: "Pick a starting point", body: "Open the MemeForge editor. From the left sidebar, choose Templates to start from a layout (classic top/bottom, multi-panel, comparison, etc.), or Upload to drag in your own JPG, PNG, or WebP image. You can also start from a blank canvas." },
      { heading: "Add your text", body: "Click 'Add text layer' in the Text tab. Type your caption. The default is the classic Impact look with white text and a black outline. You can add as many text layers as you need." },
      { heading: "Customize the styling", body: "With a text layer selected, the right sidebar shows every property: font (10+ options), weight, size, color, outline color and width, background fill, shadow, letter spacing, line height, alignment, opacity, and rotation." },
      { heading: "Drag, resize, rotate", body: "Drag the layer body to move it. Drag a corner handle to resize. Drag the round handle above the top edge to rotate. Rotation snaps to 0/90/180/270 within four degrees for clean alignment." },
      { heading: "Resize for your platform", body: "In the Size tab, pick a preset: Instagram square, Instagram portrait, Instagram Story, TikTok vertical, YouTube thumbnail, X post, WhatsApp. The canvas resizes and layers scale proportionally." },
      { heading: "Check quality and export", body: "Click 'Quality check' in the top toolbar to scan for overflow, low contrast, off-canvas elements, and resolution issues. Then click Download and pick PNG, JPG, or WebP. No watermark. No signup. The file is yours." },
    ],
    tip: "For maximum shareability, the punchline belongs in the bottom text. The setup belongs in the top text. Use uppercase Impact with a 4-6px outline for the classic look that reads on any image.",
  },
  "how-to-add-text-to-a-meme": {
    slug: "how-to-add-text-to-a-meme",
    title: "How to Add Text to a Meme — Typography & Style Guide | MemeForge",
    metaDescription: "Add text to any meme. Pick fonts, colors, outlines, shadows, and backgrounds. Auto-fit text to the box. Free with MemeForge.",
    excerpt: "Everything about adding and styling text on a meme — fonts, outlines, shadows, alignment, and the one-click auto-fit.",
    steps: [
      { heading: "Add a text layer", body: "In the editor, open the Text tab in the left sidebar and click 'Add text layer'. A new Impact-style text layer appears in the center of the canvas, selected and ready to edit." },
      { heading: "Type your caption", body: "The right sidebar shows a Text content textarea. Type your caption. Multi-line text is supported — press Enter to break lines manually. The layer auto-wraps long text to fit the box." },
      { heading: "Pick a font", body: "Choose from 10+ fonts: Impact (classic), Inter (modern), Georgia (serif), Courier (mono), Comic Sans, Caveat (handwritten), plus Arial, Tahoma, Trebuchet MS, and Verdana. The font changes the entire mood of the meme." },
      { heading: "Style color and outline", body: "Pick a text color, then an outline color and width. The classic look is white text with a 4-6px black outline. Increase the outline width when the background image is busy. The contrast checker warns you if readability is at risk." },
      { heading: "Add shadow or background", body: "Toggle Shadow on for a glow effect — set color and blur. Add a background fill behind the text for caption-card style. Set the background to 'transparent' to remove it." },
      { heading: "Auto-fit to the box", body: "Click 'Auto-fit text to box' to deterministically pick the largest font size that still fits inside the layer's bounding box. Useful when you change the text length and want the size to re-balance." },
    ],
    tip: "Auto-fit is deterministic — it shrinks or grows the font size in 2px steps until the text fits the box without overflow. It always converges and never requires AI.",
  },
  "how-to-make-a-two-panel-meme": {
    slug: "how-to-make-a-two-panel-meme",
    title: "How to Make a Two-Panel Meme — Before/After, Comparison | MemeForge",
    metaDescription: "Step-by-step guide to making two-panel memes. Before/after, expectation/reality, me vs also me. Upload a different image into each panel. Free.",
    excerpt: "Build a two-panel meme — before/after, expectation/reality, me vs also me — with one image per panel.",
    steps: [
      { heading: "Pick a two-panel template", body: "In the editor's Size tab under Multi-panel layouts, choose 2-panel horizontal or 2-panel vertical. You can also use the dedicated 'Expectation vs Reality' template from the Templates tab." },
      { heading: "Upload two images", body: "Switch to the Upload tab and upload your first image. Position it over the left/top panel using drag and resize. Then upload a second image and position it over the right/bottom panel. Use object-fit 'cover' to fill each panel cleanly." },
      { heading: "Add captions per panel", body: "Add a text layer for each panel. Drag each one to its panel and set its text. Use uppercase Impact with a black outline for the classic look. For expectation/reality, use the colored labels already in the template." },
      { heading: "Adjust the panel border", body: "If you used a template, the divider shape is its own layer. Select it in the canvas to change its fill, stroke, or thickness. You can also delete the divider for a seamless split." },
      { heading: "Resize for your platform", body: "If you're going to Instagram Story or TikTok, switch the canvas to 1080×1920 in the Size tab. The two panels rescale. Drag any element to reposition for the new aspect ratio." },
      { heading: "Export", body: "Click Download and pick PNG or JPG. The export matches the editor preview exactly, with no watermark." },
    ],
    tip: "Two-panel memes work best when each panel has a clear visual 'before' and 'after' relationship. Keep captions short — three to seven words per panel is the sweet spot.",
  },
  "how-to-resize-memes-for-instagram": {
    slug: "how-to-resize-memes-for-instagram",
    title: "How to Resize Memes for Instagram — 1080×1080, 1350, 1920 | MemeForge",
    metaDescription: "Resize memes for Instagram square (1080×1080), portrait (1080×1350), and Story (1080×1920) in one click. Free, with readable text. MemeForge guide.",
    excerpt: "Resize your meme for Instagram's three core formats in one click, without redoing your design.",
    steps: [
      { heading: "Pick the right format", body: "Instagram square (1080×1080) is the standard feed post. Instagram portrait (1080×1350) takes more vertical real estate in the feed. Instagram Story (1080×1920) is for Stories and Reels covers." },
      { heading: "Open the size tab", body: "In the editor, open the Size tab in the left sidebar. The platform presets are at the top. Pick 'Instagram Square', 'Instagram Portrait', or 'Instagram Story'." },
      { heading: "Let layers rescale", body: "When you switch presets, the canvas resizes and every layer scales proportionally based on the smaller dimension. Text stays the same relative size and readability. Images and shapes keep their aspect ratio." },
      { heading: "Reposition any element", body: "After resizing, drag any element to reposition it for the new aspect ratio. The quality checker warns you if any text would clip outside the new canvas." },
      { heading: "Check readability", body: "Open the Quality check dialog. Warnings for low contrast or text overflow help you catch readability problems before posting." },
      { heading: "Export at full resolution", body: "Click Download and pick PNG (lossless) or JPG (smaller, faster upload). Exports are at the full 1080px width — exactly Instagram's sweet spot." },
    ],
    tip: "Switching aspect ratios from square to portrait can leave the bottom 270px of the canvas empty. Move your punchline text down into the new vertical space — it gives the meme room to breathe.",
  },
  "how-to-create-gif-memes": {
    slug: "how-to-create-gif-memes",
    title: "How to Create GIF Memes — Text on Animated GIFs | MemeForge",
    metaDescription: "Plan and design GIF meme captions in MemeForge. Upload a still frame, style text, then composite over the original GIF. Free guide.",
    excerpt: "How to plan and design captions for GIF memes — and the current state of MemeForge's GIF support.",
    steps: [
      { heading: "Understand current GIF support", body: "MemeForge's image editor accepts GIF files as still-frame image layers today. Full animated export with preserved frame timing is on our roadmap and will ship when it works reliably across browsers. The workflow below helps you design captions today and reuse them later." },
      { heading: "Pick a representative frame", body: "From your animated GIF, pick the frame that best represents the punchline. Save it as a PNG or JPG. This is the frame your caption will sit on." },
      { heading: "Upload the frame to MemeForge", body: "Open the editor, switch to the Upload tab, and drag in your frame. Position the image to fill the canvas. Use object-fit 'cover' if needed." },
      { heading: "Design your caption", body: "Add a text layer, type your caption, and style it with font, color, outline, and shadow. Use drag, resize, and rotate to position the caption exactly where it should appear on the final GIF." },
      { heading: "Note your settings", body: "Note the font, font size, color, outline width, and X/Y/width/height of your text layer. You'll re-use these exact settings when compositing the text over the original animated GIF in any standard GIF tool." },
      { heading: "Export a poster frame", body: "Click Download and pick PNG. The exported image is your GIF meme's poster frame — useful as a thumbnail and as a reference when you composite over the animated GIF." },
    ],
    tip: "GIF memes live or die on timing. Plan your caption to be readable on the very first frame so it lands even before the animation loops.",
  },
};

export default function GuideView({ slug }: { slug?: string }) {
  const setView = useMemeStore((s) => s.setView);

  useEffect(() => {
    if (slug && GUIDES[slug]) {
      trackPageView(`/guide/${slug}`);
      document.title = GUIDES[slug].title;
    } else {
      trackPageView("/guides");
      document.title = "Meme Guides & Tutorials | MemeForge";
    }
  }, [slug]);

  if (slug && GUIDES[slug]) {
    const g = GUIDES[slug];
    return (
      <div>
        <section className="bg-gradient-to-b from-violet-50 to-white border-b">
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
            <nav className="text-xs text-muted-foreground mb-3">
              <button onClick={() => setView("home")} className="hover:text-primary">Home</button>
              <span className="mx-1.5">/</span>
              <button onClick={() => setView("guides")} className="hover:text-primary">Guides</button>
              <span className="mx-1.5">/</span>
              <span className="text-foreground">{g.title.split(" — ")[0]}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{g.title.split(" — ")[0]}</h1>
            <p className="text-lg text-muted-foreground mt-3">{g.excerpt}</p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
            {g.steps.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{i + 1}</div>
                <div>
                  <h2 className="text-xl font-bold mb-2">{s.heading}</h2>
                  <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
            {g.tip && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-5">
                  <div className="text-sm font-semibold mb-1">Pro tip</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.tip}</p>
                </CardContent>
              </Card>
            )}
            <div className="pt-4">
              <Button size="lg" className="gap-2" onClick={() => setView("editor")}>
                <Sparkles className="w-4 h-4" /> Try it in the editor
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-medium mb-3">
          <BookOpen className="w-3.5 h-3.5" /> Guides
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Meme guides & tutorials</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Original, practical walkthroughs for making better memes — written for actual creators, not for search engines.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Object.values(GUIDES).map((g) => (
          <Card key={g.slug} className="hover:border-primary hover:shadow-md transition cursor-pointer" >
            <CardContent className="pt-5" onClick={() => useMemeStore.setState({ view: "guide", viewParams: { slug: g.slug } })}>
              <h2 className="text-lg font-semibold mb-1.5">{g.title.split(" — ")[0]}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{g.excerpt}</p>
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
                Read guide <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
