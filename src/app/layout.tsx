import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://memeforge.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MemeForge — Free Online Meme Generator. No Signup. No Watermark.",
    template: "%s | MemeForge",
  },
  description:
    "MemeForge is a free online meme generator. Create memes from templates or your own images, add customizable text, build multi-panel memes, resize for any social platform, and download watermark-free PNG, JPG, and WebP. No signup.",
  keywords: [
    "meme generator",
    "free meme generator",
    "online meme generator",
    "meme maker",
    "meme creator",
    "no signup meme generator",
    "meme generator with text",
    "custom meme generator",
    "image to meme",
    "multi panel meme maker",
    "gif meme maker",
    "video meme maker",
    "instagram meme maker",
    "whatsapp meme maker",
  ],
  authors: [{ name: "MemeForge" }],
  applicationName: "MemeForge",
  category: "Design",
  creator: "MemeForge",
  publisher: "MemeForge",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MemeForge",
    title: "MemeForge — Free Meme Generator. No Signup. No Watermark.",
    description:
      "Create memes in seconds. Free, online, no signup, no watermark. Multi-panel, platform-ready resizing, batch creation, and 10+ fonts.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MemeForge — Free Meme Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeForge — Free Meme Generator",
    description: "Create memes in seconds. Free, online, no signup, no watermark.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#7c3aed"/><path d="M22 14h20l-6 18 16-3-22 21 6-18-16 3z" fill="#fff"/></svg>'), type: "image/svg+xml" },
    ],
  },
  manifest: undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7c3aed",
};

// JSON-LD structured data describing the WebApplication
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MemeForge",
  applicationCategory: "DesignApplication",
  applicationSubCategory: "ImageEditor",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript. Requires HTML5 Canvas.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "MemeForge is a free online meme generator that allows users to create memes from templates or uploaded images, add customizable text, build multi-panel memes, resize content for social platforms, and download watermark-free images without signing up.",
  featureList: [
    "Multi-panel meme creation (2, 3, 4 panels)",
    "Platform-ready resizing (Instagram, TikTok, X, YouTube, Facebook, WhatsApp)",
    "Batch meme generation from a list of captions",
    "Text layers with fonts, outlines, shadows, backgrounds",
    "Drag, resize, rotate controls",
    "Quality checker (overflow, contrast, off-canvas)",
    "PNG, JPG, WebP export — no watermark",
    "AI caption assistant (optional)",
    "Privacy-first local image processing",
  ],
  url: SITE_URL,
  isAccessibleForFree: true,
  isFamilyFriendly: true,
  inLanguage: ["en"],
  audience: { "@type": "Audience", audienceType: "content creators, social media users, marketers" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MemeForge",
  url: SITE_URL,
  description: "Free online meme generator. No signup, no watermark.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is MemeForge really free?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. The core meme generator — templates, uploads, text editing, multi-panel memes, platform resizing, batch creation, and PNG/JPG/WebP export — is completely free with no watermark and no signup." },
    },
    {
      "@type": "Question",
      name: "Do I need to create an account?",
      acceptedAnswer: { "@type": "Answer", text: "No. Open the editor, make your meme, and download it. We never require registration. Your recent templates and last editing session are stored in your browser's local storage, which you can clear at any time." },
    },
    {
      "@type": "Question",
      name: "Will my exported meme have a watermark?",
      acceptedAnswer: { "@type": "Answer", text: "No. Every export is watermark-free by default. There is an optional watermark tool for creators who want to brand their own memes, but it is off by default and never automatic." },
    },
    {
      "@type": "Question",
      name: "Can I make multi-panel memes?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. MemeForge supports two-panel horizontal, two-panel vertical, three-panel strip, four-panel grid, before/after, and expectation/reality layouts. You can upload a different image into each panel." },
    },
    {
      "@type": "Question",
      name: "Can I resize my meme for Instagram, TikTok, or YouTube?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. We have one-click presets for Instagram square (1080x1080), Instagram portrait (1080x1350), Instagram Story (1080x1920), Facebook post (1200x1200), X post (1200x675), TikTok vertical (1080x1920), YouTube thumbnail (1280x720), and WhatsApp share (1080x1080). You can also set custom dimensions." },
    },
    {
      "@type": "Question",
      name: "Are my uploaded images sent to your servers?",
      acceptedAnswer: { "@type": "Answer", text: "For ordinary editing, no. Images are processed in your browser using the Canvas API. We do not store your uploaded images permanently, and we do not use them for training. The optional AI caption assistant sends your text context to our backend, but never your image." },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
