import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// Trending memes aggregator.
// Pulls real viral meme data from:
//   1. Imgflip's public get_memes endpoint — top 100 trending meme templates (no auth, free).
//   2. z-ai image search — fresh viral meme images pulled from the open web.
//   3. z-ai chat completion — text context on what's trending right now.
// Results are cached in-memory for 30 minutes.

interface TrendingMeme {
  id: string;
  title: string;
  imageUrl: string;
  width?: number;
  height?: number;
  source: "imgflip" | "web";
  captions?: number;
  boxCount?: number;
  url?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
let cache: { ts: number; data: any } | null = null;

// Wrap a promise with a hard timeout so a slow upstream never blocks the whole response.
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function fetchImgflip(): Promise<TrendingMeme[]> {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes", {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data?.memes)) return [];
    return (json.data.memes as any[])
      .sort((a, b) => (b.captions || 0) - (a.captions || 0))
      .slice(0, 30)
      .map((m) => ({
        id: `imgflip_${m.id}`,
        title: m.name,
        imageUrl: m.url,
        width: m.width,
        height: m.height,
        source: "imgflip" as const,
        captions: m.captions,
        boxCount: m.box_count,
        url: `https://imgflip.com/meme/${m.id}`,
      }));
  } catch {
    return [];
  }
}

async function fetchWebMemes(): Promise<TrendingMeme[]> {
  try {
    const zai = await ZAI.create();
    const now = new Date();
    const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const imageRes: any = await withTimeout(
      zai.images.search.create({
        query: `viral meme template ${monthYear}`,
        count: 12,
        gl: "us",
        rank: true,
      } as any),
      8000,
      { success: false, results: [] }
    );
    if (imageRes?.success && Array.isArray(imageRes.results)) {
      return imageRes.results
        .filter((r: any) => r.original_url)
        .slice(0, 12)
        .map((r: any, i: number) => ({
          id: `web_${i}_${Math.random().toString(36).slice(2, 8)}`,
          title: r.caption || `Trending meme ${i + 1}`,
          imageUrl: r.original_url,
          source: "web" as const,
          url: r.source || r.original_url,
        }));
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchTrendingTopics(): Promise<string[]> {
  try {
    const zai = await ZAI.create();
    const now = new Date();
    const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const completion: any = await withTimeout(
      zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a meme trend reporter. Return exactly 8 currently trending meme topics or formats as a JSON array of strings. Each string 3-8 words. No commentary, no markdown. Reflect what is actually trending on social media this month (${monthYear}).`,
          },
          { role: "user", content: `What meme formats and topics are trending on social media right now in ${monthYear}?` },
        ],
        temperature: 0.7,
        max_tokens: 300,
      } as any),
      8000,
      { choices: [{ message: { content: "[]" } }] }
    );
    const raw = completion?.choices?.[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.filter((x) => typeof x === "string").slice(0, 8);
      }
    } catch {
      return cleaned.split(/\n+/).map((l) => l.replace(/^[\d\-\.\)\]\s]+/, "").trim().replace(/^["']|["']$/g, "")).filter((l) => l.length > 3 && l.length < 80).slice(0, 8);
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  // Run all three in parallel with hard timeouts so the worst case is ~8s not 25s.
  const [imgflipMemes, webMemes, topics] = await Promise.all([
    fetchImgflip(),
    fetchWebMemes(),
    fetchTrendingTopics(),
  ]);

  // Deduplicate by image URL.
  const seen = new Set<string>();
  const allMemes: TrendingMeme[] = [];
  for (const m of [...imgflipMemes, ...webMemes]) {
    if (seen.has(m.imageUrl)) continue;
    seen.add(m.imageUrl);
    allMemes.push(m);
  }

  const data = {
    memes: allMemes,
    trending: topics,
    generatedAt: new Date().toISOString(),
    sources: {
      imgflip: imgflipMemes.length,
      web: webMemes.length,
    },
  };

  cache = { ts: Date.now(), data };
  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
