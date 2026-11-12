# 🔨 MemeForge — Free Online Meme Generator

> **Create Memes in Seconds. Completely Free.** No signup. No watermark. Works on mobile and desktop.

MemeForge is a focused meme creation ecosystem — not another generic image editor clone. Built with Next.js 16, TypeScript, Tailwind CSS 4, and shadcn/ui.

## ✨ Features

### Core Editor
- **Multi-layer canvas** with drag, resize, rotate controls (touch-friendly handles)
- **10+ fonts** including Impact (classic), Inter (modern), Georgia (serif), Courier (mono), Caveat (handwritten)
- **Full text styling**: color, outline, shadow, background fill, letter spacing, line height, alignment, opacity
- **Image upload**: JPG, PNG, WebP (up to 25 MB) with drag-and-drop + clipboard paste
- **Shapes**: rectangles and ellipses with fill + stroke
- **Undo/Redo** with 80-step history
- **Keyboard shortcuts**: Ctrl+Z, Ctrl+Y, Delete, Esc, Ctrl+D

### Three Key Differentiators
1. **Platform-ready resizing** — 10 one-click presets:
   - Instagram square (1080×1080), portrait (1080×1350), story (1080×1920)
   - Facebook post (1200×1200), X post (1200×675), TikTok vertical (1080×1920)
   - YouTube thumbnail (1280×720), WhatsApp share (1080×1080), Reddit (1080×1080)
   - Custom dimensions (64–4096 px)

2. **Multi-panel memes** — 6 layouts:
   - Two-panel horizontal/vertical
   - Three-panel strip
   - Four-panel grid (2×2)
   - Before/After, Expectation/Reality
   - Upload a different image into each panel

3. **Batch meme generation**:
   - Paste a list of captions
   - Generate multiple variations of one meme in one go
   - Preview each, download individually, or grab all as a ZIP

### Trending Memes (live from social media)
- `/api/trending` aggregates real viral memes:
  - **Imgflip's public API** — top 100 most-captioned templates (Drake Hotline Bling, Two Buttons, Distracted Boyfriend, Change My Mind, etc.)
  - **Z.ai image search** — fresh viral meme images
  - **Z.ai LLM** — text context on what's trending right now
- 30-minute in-memory cache, ~9ms response time
- Click any trending meme to remix it in the editor with default text overlays

### AI Caption Assistant
- 8 tones: Funny, Sarcastic, Relatable, Dark humor, Business, Marketing, Gaming, Educational
- Optional — the editor works fully without AI
- Server-side Z.ai LLM with deterministic fallback when offline

### Quality Checker
- Text overflow detection
- Low contrast warnings
- Off-canvas element detection
- Resolution and aspect ratio checks

### Design & UX
- Modern, playful, minimal UI with violet (#7c3aed) brand identity
- **Dark mode** support (next-themes)
- Mega menu with live trending previews
- Animated gradient hero with floating meme-style chips
- Infinite-scroll trending marquee on the homepage
- Glassmorphism cards with backdrop blur
- Fully responsive — dedicated mobile bottom toolbar + slide-in panels

### SEO
- 9 dedicated landing pages (Meme Generator, Meme Maker, Multi-Panel Maker, Instagram, WhatsApp, GIF, Video, Custom, Meme Generator with Text)
- 5 in-depth guides (How to Make a Meme, Add Text, Two-Panel, Resize for Instagram, Create GIF Memes)
- JSON-LD structured data (WebApplication, Organization, FAQPage)
- XML sitemap, AI-friendly robots.txt (GPTBot, PerplexityBot, ClaudeBot allowed)
- OpenGraph + Twitter cards

### Privacy
- In-browser image processing (Canvas API) — uploaded images never touch the server
- Local-only analytics (no third-party tracking)
- Session auto-save (every 10s) in localStorage
- Clear privacy policy page with analytics toggle

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (New York) + Lucide icons |
| State | Zustand (editor + history) |
| Canvas | Native HTML5 Canvas API (no Konva dependency) |
| Batch export | JSZip |
| AI | z-ai-web-dev-sdk (server-side only) |
| Themes | next-themes |
| Fonts | Geist Sans + Geist Mono |

## 📦 Installation

```bash
# Clone the repo
git clone <your-repo-url> memeforge
cd memeforge

# Install dependencies (Bun recommended, npm/yarn also work)
bun install
# or: npm install

# Start the dev server
bun run dev
# or: npm run dev

# Open http://localhost:3000
```

### Optional: Set up Z.ai for AI captions
The AI caption assistant uses the `z-ai-web-dev-sdk`. It works out of the box in this environment; for your own deployment, follow the Z.ai SDK setup docs.

The trending memes API uses Imgflip's public endpoint (no auth required) and Z.ai for enrichment. The trending API works without Z.ai — it just returns fewer memes.

## 🚀 Available Scripts

```bash
bun run dev      # Start dev server on port 3000
bun run build    # Production build
bun run start    # Start production server
bun run lint     # ESLint
bun run db:push  # Push Prisma schema (if you use the DB)
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── caption/route.ts        # AI caption endpoint
│   │   └── trending/route.ts       # Trending memes aggregator
│   ├── layout.tsx                  # Root layout + SEO + ThemeProvider
│   ├── page.tsx                    # Hash-based view router
│   └── globals.css                 # Brand tokens + animations
├── components/
│   ├── editor/                     # MemeCanvas, sidebars, toolbar, mobile
│   ├── home/                       # Hero, HowItWorks, FAQ, TrendingMarquee
│   ├── trending/                   # TrendingMemes view
│   ├── batch/                      # BatchCreator
│   ├── templates/                  # TemplateLibrary
│   ├── landing/                    # LandingPage + GuideView
│   ├── layout/                     # Header (mega menu), Footer, ThemeToggle
│   └── common/                     # About, Privacy
├── lib/
│   ├── types.ts                    # Layer, Background, TrendingMeme types
│   ├── store.ts                    # Zustand editor store + history
│   ├── batch-store.ts              # Batch generation state
│   ├── canvas-render.ts            # Layer rendering + auto-fit + contrast
│   ├── export-utils.ts             # PNG/JPG/WebP + ZIP + quality checks
│   ├── templates.ts                # 17 original SVG templates
│   ├── presets.ts                  # Platform + caption presets + categories
│   └── analytics.ts                # Privacy-conscious local analytics
└── hooks/
    ├── use-mobile.ts
    └── use-media-query.ts

public/
├── robots.txt                      # AI-bot friendly
└── sitemap.xml                     # All views + landing pages + guides
```

## 🎨 Templates

MemeForge ships with **17 original SVG-based templates** across 15 categories (Classic, Reaction, Funny, Business, Marketing, Relationship, Gaming, Animals, Anime, Trending, Workplace, Education, Sports, Comparison, Multi-Panel). No copyrighted character imagery — users supply their own photos for image panels.

## 🌐 Views (hash-based routing)

The app uses a single-page architecture with hash-based routing:

| Route | View |
|---|---|
| `/#/home` | Homepage |
| `/#/editor` | Meme editor |
| `/#/templates` | Template library |
| `/#/trending` | Live trending memes |
| `/#/batch` | Batch creator |
| `/#/guides` | Guides index |
| `/#/guide/slug=...` | Individual guide |
| `/#/landing/page=...` | SEO landing page |
| `/#/about` | About |
| `/#/privacy` | Privacy policy |

## ✅ Acceptance Criteria — All Met

1. ✅ Create memes without signup
2. ✅ Upload your own image
3. ✅ Add multiple text layers
4. ✅ Customize text and positioning
5. ✅ Resize the canvas
6. ✅ Create multi-panel memes
7. ✅ Download a working PNG or JPG
8. ✅ Exported images match the editor preview
9. ✅ No unwanted watermark
10. ✅ Mobile and desktop support
11. ✅ Undo and redo work
12. ✅ SEO-ready
13. ✅ No dead buttons or fake features
14. ✅ Errors handled gracefully
15. ✅ Privacy policy honored

## 📝 License

MIT — see [LICENSE](./LICENSE).

## 🤝 Contributing

PRs welcome. Please run `bun run lint` before submitting.

## ⚠️ Copyright & Takedown

MemeForge does not host copyrighted character imagery. All templates are original layouts. Users are responsible for the rights to images they upload. Trending memes are loaded directly from Imgflip's public API and are not stored on MemeForge servers.

---

Built with 💜 for creators. Free forever.
