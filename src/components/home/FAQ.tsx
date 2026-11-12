"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useMemeStore } from "@/lib/store";

const FAQS = [
  {
    q: "Is MemeForge really free?",
    a: "Yes. The core meme generator — templates, uploads, text editing, multi-panel memes, platform resizing, batch creation, and PNG/JPG/WebP export — is completely free with no watermark and no signup. We may add optional Pro tiers later for power features, but the core will stay free forever.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Open the editor, make your meme, and download it. We never require registration. Your recent templates and your last editing session are stored in your own browser's local storage, which you can clear at any time.",
  },
  {
    q: "Will my exported meme have a watermark?",
    a: "No. Every export is watermark-free by default. There is an optional watermark tool for creators who want to brand their own memes, but it is off by default and never automatic.",
  },
  {
    q: "What image formats can I upload and export?",
    a: "You can upload JPG, PNG, and WebP files (up to 25 MB each). You can export PNG (lossless, supports transparent background), JPG (compressed), and WebP (modern, smaller files). For batch creation, you can download all variations as a ZIP.",
  },
  {
    q: "Are my uploaded images sent to your servers?",
    a: "For ordinary editing, no. Images are processed in your browser using the Canvas API. We do not store your uploaded images permanently, and we do not use them for training. The optional AI caption assistant sends your text context to our backend, but never your image.",
  },
  {
    q: "Can I make multi-panel memes?",
    a: "Yes. MemeForge supports two-panel horizontal, two-panel vertical, three-panel strip, four-panel grid, before/after, and expectation/reality layouts. You can upload a different image into each panel.",
  },
  {
    q: "Can I resize my meme for Instagram, TikTok, or YouTube?",
    a: "Yes. We have one-click presets for Instagram square (1080×1080), Instagram portrait (1080×1350), Instagram Story (1080×1920), Facebook post (1200×1200), X post (1200×675), TikTok vertical (1080×1920), YouTube thumbnail (1280×720), and WhatsApp share (1080×1080). You can also set custom dimensions.",
  },
  {
    q: "Can I generate multiple memes at once?",
    a: "Yes. The Batch Creator lets you paste a list of captions and instantly generate multiple variations of the same meme. Preview each one, download individually, or download all as a ZIP.",
  },
  {
    q: "What templates do you offer?",
    a: "We build original layouts in classic, reaction, multi-panel, comparison, workplace, gaming, marketing, education, sports, animals, anime-style, and trending categories. We do not host copyrighted character imagery — users supply their own photos for image panels.",
  },
  {
    q: "Does the AI caption assistant always work?",
    a: "The AI caption assistant is optional. The editor works fully without AI. If the AI service is unavailable, we provide deterministic fallback suggestions in your selected tone so the experience never breaks.",
  },
  {
    q: "Who owns the memes I create?",
    a: "You do. We do not claim ownership of any meme you create. You are responsible for the rights to images you upload. We provide a copyright and takedown process for any unauthorized use.",
  },
];

export default function FAQ() {
  const setView = useMemeStore((s) => s.setView);
  return (
    <section className="py-16 sm:py-20 border-b">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-medium mb-3">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-3">Everything you need to know about MemeForge.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-10">
          <Button size="lg" className="gap-2" onClick={() => setView("editor")}>
            Try MemeForge free →
          </Button>
        </div>
      </div>
    </section>
  );
}
