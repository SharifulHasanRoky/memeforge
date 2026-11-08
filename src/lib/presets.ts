import type { PlatformPreset, CaptionPreset, TemplateCategory } from "./types";

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "custom", label: "Custom", width: 1080, height: 1080, description: "Custom dimensions", icon: "Square" },
  { id: "instagram_square", label: "Instagram Square", width: 1080, height: 1080, description: "1:1 feed post", icon: "Instagram" },
  { id: "instagram_portrait", label: "Instagram Portrait", width: 1080, height: 1350, description: "4:5 portrait post", icon: "Instagram" },
  { id: "instagram_story", label: "Instagram Story", width: 1080, height: 1920, description: "9:16 story / reel", icon: "Instagram" },
  { id: "facebook_post", label: "Facebook Post", width: 1200, height: 1200, description: "1:1 Facebook feed", icon: "Facebook" },
  { id: "x_post", label: "X (Twitter) Post", width: 1200, height: 675, description: "16:9 in-stream", icon: "Twitter" },
  { id: "tiktok_vertical", label: "TikTok Vertical", width: 1080, height: 1920, description: "9:16 vertical video frame", icon: "Video" },
  { id: "youtube_thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720, description: "16:9 thumbnail", icon: "Youtube" },
  { id: "whatsapp", label: "WhatsApp Share", width: 1080, height: 1080, description: "Square share image", icon: "MessageCircle" },
  { id: "reddit", label: "Reddit Meme", width: 1080, height: 1080, description: "1:1 subreddit standard", icon: "MessageSquare" },
];

export const CAPTION_PRESETS: CaptionPreset[] = [
  { id: "top_bottom", label: "Top / Bottom", structure: "Top text\n— image —\nBottom text", example: "WHEN MONDAY HITS\n— image —\nAND COFFEE ISN'T ENOUGH" },
  { id: "expectation_reality", label: "Expectation / Reality", structure: "EXPECTATION:\n— image 1 —\nREALITY:\n— image 2 —", example: "EXPECTATION: Remote work productivity\nREALITY: Working from bed in pajamas" },
  { id: "nobody_me", label: "Nobody / Me", structure: "Nobody:\n— silence —\nMe:", example: "Nobody:\n\nMe: Let me just check the deploy one more time at 3am" },
  { id: "when_but", label: "When You / But Then", structure: "When you...\n— image —\nBut then...", example: "When you finally fix the bug\nBut then 5 more appear" },
  { id: "pov", label: "POV", structure: "POV: ...", example: "POV: You're the last dev to leave the office at midnight" },
  { id: "me_trying", label: "Me Trying To", structure: "Me trying to...", example: "Me trying to explain why the build broke on a Friday afternoon" },
  { id: "that_moment", label: "That Moment When", structure: "That moment when...", example: "That moment when production works on your machine but nowhere else" },
  { id: "drake", label: "Reject / Approve", structure: "Rejecting: ...\nApproving: ...", example: "Rejecting: Writing tests\nApproving: 'It worked on my machine'" },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: "classic", name: "Classic", description: "Timeless single-panel meme formats", icon: "Crown" },
  { id: "reaction", name: "Reaction", description: "Expressive reaction-style layouts", icon: "Laugh" },
  { id: "funny", name: "Funny", description: "General funny caption layouts", icon: "Smile" },
  { id: "business", name: "Business", description: "Workplace and office humor", icon: "Briefcase" },
  { id: "marketing", name: "Marketing", description: "Marketer and growth humor", icon: "Megaphone" },
  { id: "relationship", name: "Relationship", description: "Couples and dating humor", icon: "Heart" },
  { id: "gaming", name: "Gaming", description: "Gamer and streamer humor", icon: "Gamepad2" },
  { id: "animals", name: "Animals", description: "Pet and animal caption layouts", icon: "PawPrint" },
  { id: "anime", name: "Anime", description: "Anime-inspired original layouts", icon: "Sparkles" },
  { id: "trending", name: "Trending", description: "Currently popular formats", icon: "Flame" },
  { id: "workplace", name: "Workplace", description: "Coworkers and office life", icon: "Coffee" },
  { id: "education", name: "Education", description: "School, study, and learning humor", icon: "GraduationCap" },
  { id: "sports", name: "Sports", description: "Sports fan and athlete humor", icon: "Trophy" },
  { id: "comparison", name: "Comparison", description: "Before/after and vs formats", icon: "Columns2" },
  { id: "multi_panel", name: "Multi-Panel", description: "Two, three, and four panel layouts", icon: "LayoutGrid" },
];
