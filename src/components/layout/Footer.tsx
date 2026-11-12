"use client";

import { useMemeStore } from "@/lib/store";
import { Hammer, Github, Twitter, Heart } from "lucide-react";

const LINKS: { label: string; view: any; params?: Record<string, string> }[] = [
  { label: "🔥 Trending Memes", view: "trending" },
  { label: "Meme Generator", view: "landing", params: { page: "meme-generator" } },
  { label: "Meme Maker", view: "landing", params: { page: "meme-maker" } },
  { label: "Multi-Panel Meme Maker", view: "landing", params: { page: "multi-panel-meme-maker" } },
  { label: "GIF Meme Maker", view: "landing", params: { page: "gif-meme-maker" } },
  { label: "Video Meme Maker", view: "landing", params: { page: "video-meme-maker" } },
  { label: "Instagram Meme Maker", view: "landing", params: { page: "instagram-meme-maker" } },
  { label: "WhatsApp Meme Maker", view: "landing", params: { page: "whatsapp-meme-maker" } },
  { label: "Custom Meme Maker", view: "landing", params: { page: "custom-meme-maker" } },
  { label: "Meme Generator with Text", view: "landing", params: { page: "meme-generator-with-text" } },
];

const GUIDES: { label: string; view: any; params?: Record<string, string> }[] = [
  { label: "How to Make a Meme", view: "guide", params: { slug: "how-to-make-a-meme" } },
  { label: "How to Add Text to a Meme", view: "guide", params: { slug: "how-to-add-text-to-a-meme" } },
  { label: "How to Make a Two-Panel Meme", view: "guide", params: { slug: "how-to-make-a-two-panel-meme" } },
  { label: "How to Resize Memes for Instagram", view: "guide", params: { slug: "how-to-resize-memes-for-instagram" } },
  { label: "How to Create GIF Memes", view: "guide", params: { slug: "how-to-create-gif-memes" } },
];

export default function Footer() {
  const setView = useMemeStore((s) => s.setView);
  const setParams = (p: Record<string, string>) => useMemeStore.setState({ viewParams: p });

  const nav = (item: { view: any; params?: Record<string, string> }) => {
    if (item.params) setParams(item.params);
    setView(item.view);
  };

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-lg">
              <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Hammer className="w-3.5 h-3.5" />
              </span>
              MemeForge
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Free online meme generator. Create, customize, and download watermark-free memes in seconds. No signup.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">Tools</div>
            <ul className="space-y-1.5 text-sm">
              {LINKS.slice(0, 5).map((l, i) => (
                <li key={i}>
                  <button className="hover:text-primary text-muted-foreground transition" onClick={() => nav(l)}>{l.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">More tools</div>
            <ul className="space-y-1.5 text-sm">
              {LINKS.slice(5).map((l, i) => (
                <li key={i}>
                  <button className="hover:text-primary text-muted-foreground transition" onClick={() => nav(l)}>{l.label}</button>
                </li>
              ))}
              <li>
                <button className="hover:text-primary text-muted-foreground transition" onClick={() => setView("templates")}>All Templates</button>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">Guides & policy</div>
            <ul className="space-y-1.5 text-sm">
              {GUIDES.map((g, i) => (
                <li key={i}>
                  <button className="hover:text-primary text-muted-foreground transition" onClick={() => nav(g)}>{g.label}</button>
                </li>
              ))}
              <li>
                <button className="hover:text-primary text-muted-foreground transition" onClick={() => setView("about")}>About</button>
              </li>
              <li>
                <button className="hover:text-primary text-muted-foreground transition" onClick={() => setView("privacy")}>Privacy</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MemeForge. Memes are the responsibility of their creators. Use only images you have the rights to.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-pink-500" /> for creators
            </span>
            <Github className="w-4 h-4" />
            <Twitter className="w-4 h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
