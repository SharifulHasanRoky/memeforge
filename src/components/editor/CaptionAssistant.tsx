"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Wand2, Check } from "lucide-react";
import type { CaptionTone } from "@/lib/types";
import { trackCaptionGenerate } from "@/lib/analytics";

const TONES: { id: CaptionTone; label: string; emoji: string }[] = [
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "sarcastic", label: "Sarcastic", emoji: "😏" },
  { id: "relatable", label: "Relatable", emoji: "🤝" },
  { id: "dark", label: "Dark humor", emoji: "🌚" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "marketing", label: "Marketing", emoji: "📈" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "educational", label: "Educational", emoji: "📚" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (text: string) => void;
  currentText: string;
}

export default function CaptionAssistant({ open, onOpenChange, onApply, currentText }: Props) {
  const [tone, setTone] = useState<CaptionTone>("funny");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setSuggestions([]);
    setSelected(null);
    trackCaptionGenerate(tone);
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, context, currentText }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const caps: string[] = Array.isArray(data?.captions) ? data.captions : [];
      if (caps.length === 0) throw new Error("Empty response");
      setSuggestions(caps);
    } catch (e) {
      toast.error("Couldn't generate captions. You can still write your own — the editor works fully offline.");
      // Fallback deterministic suggestions so the UX still works offline
      setSuggestions(getFallbackCaptions(tone, context));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Caption assistant</DialogTitle>
          <DialogDescription>
            Get AI-suggested captions for your image. You can edit every suggestion. This is optional — the editor works fully without AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Tone</div>
            <div className="grid grid-cols-4 gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-2 rounded-md border text-xs flex flex-col items-center gap-0.5 transition ${tone === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Describe your image (optional)</div>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. A cat sitting on a keyboard at 3am"
              rows={2}
              className="resize-none"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(s)}
                  className={`w-full text-left p-2 rounded-md border text-sm transition ${selected === s ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={generate} disabled={loading} className="gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? "Generating…" : suggestions.length ? "Regenerate" : "Generate captions"}
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onApply(selected);
                onOpenChange(false);
                toast.success("Caption applied — edit freely!");
              }
            }}
            className="gap-2"
          >
            <Check className="w-4 h-4" /> Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getFallbackCaptions(tone: CaptionTone, context: string): string[] {
  const base = context ? context.slice(0, 60) : "this";
  const map: Record<CaptionTone, string[]> = {
    funny: [`POV: ${base} just hit different`, `When ${base} and you feelin' unstoppable`, `Me explaining ${base} to my boss`],
    sarcastic: [`Oh sure, ${base} again`, `Wow, ${base}. How original.`, `Plot twist: ${base} was a lie`],
    relatable: [`That moment when ${base}`, `Me IRL: ${base}`, `It me. It really me. ${base}`],
    dark: [`When ${base} and the void stares back`, `${base}, but darker`, `Smiling through ${base}`],
    business: [`Synergizing ${base} for stakeholders`, `Q3 priorities: ${base}`, `Let's circle back on ${base}`],
    marketing: [`Stop scrolling. ${base} changed everything.`, `${base} = 312% more engagement`, `You won't believe what ${base} did next`],
    gaming: [`Final boss: ${base}`, `Lvl 99 at ${base}`, `New patch broke ${base}`],
    educational: [`Did you know? ${base}`, `TIL: ${base}`, `Study tip — ${base}`],
  };
  return map[tone];
}
