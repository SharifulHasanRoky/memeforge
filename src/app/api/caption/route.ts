import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const TONE_GUIDE: Record<string, string> = {
  funny: "witty, light, joke-driven",
  sarcastic: "dry, ironic, mocking in a playful way",
  relatable: "everyday-life, 'it me', universal moments",
  dark: "dark humor that's edgy but not hateful or abusive",
  business: "office/corporate humor, no real brands",
  marketing: "marketing-team humor, no real brands",
  gaming: "gamer humor, no copyrighted game titles",
  educational: "study/learning humor, school context",
};

const SYSTEM = `You are a meme caption assistant for MemeForge, a free online meme generator.
Generate 5 short, punchy meme captions for the user's image context and chosen tone.
Rules:
- Each caption must be 3-12 words. Short is better.
- Use uppercase IMPACT-style phrasing where natural.
- NEVER include hateful, racist, sexist, homophobic, transphobic, or discriminatory content.
- NEVER use real brand names, copyrighted character names, or real people's names.
- NEVER promise virality. Do not add disclaimers or commentary. Only return the captions.
- Return them as a JSON array of 5 strings, nothing else.
- If context is empty, write generic captions in the requested tone.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tone = (body?.tone as string) || "funny";
    const context = (body?.context as string) || "";
    const currentText = (body?.currentText as string) || "";
    const toneGuide = TONE_GUIDE[tone] || TONE_GUIDE.funny;

    const userMessage = `Tone: ${toneGuide}.
Context (optional): ${context || "no specific context — use your imagination"}
Existing caption (optional, can be replaced or remixed): ${currentText || "none"}
Return exactly 5 caption strings as a JSON array. No commentary, no markdown fences.`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 400,
    } as any);

    const raw = completion.choices?.[0]?.message?.content || "[]";
    let captions: string[] = [];
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        captions = parsed
          .filter((x) => typeof x === "string")
          .slice(0, 5)
          .map((x) => x.slice(0, 120));
      }
    } catch {
      captions = cleaned
        .split(/\n+/)
        .map((l) => l.replace(/^[\d\-\.\)\]\s]+/, "").trim().replace(/^["']|["']$/g, ""))
        .filter((l) => l.length > 1 && l.length < 120)
        .slice(0, 5);
    }

    if (captions.length === 0) {
      captions = [
        `POV: ${context.slice(0, 40) || "this moment"}`.toUpperCase(),
        `When ${context.slice(0, 40) || "it finally happens"}`.toUpperCase(),
        `Me explaining ${context.slice(0, 30) || "the situation"}`.toUpperCase(),
        `Not me dealing with ${context.slice(0, 30) || "this"}`.toUpperCase(),
        `That moment when ${context.slice(0, 30) || "everything aligns"}`.toUpperCase(),
      ];
    }

    return NextResponse.json({ captions });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Caption generation failed" },
      { status: 500 },
    );
  }
}
