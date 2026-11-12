// MemeForge Core Type Definitions

export type LayerType = "text" | "image" | "shape";

export type ShapeKind = "rectangle" | "ellipse" | "panel";

export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor: string | "transparent";
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  letterSpacing: number;
  lineHeight: number;
  uppercase: boolean;
  panelId?: string | null;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  objectFit: "cover" | "contain" | "fill";
  panelId?: string | null;
  borderRadius: number;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  panelId?: string | null;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer;

export type BackgroundType = "color" | "gradient" | "transparent";

export interface Background {
  type: BackgroundType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
}

export type PlatformFormat =
  | "custom"
  | "instagram_square"
  | "instagram_portrait"
  | "instagram_story"
  | "facebook_post"
  | "x_post"
  | "tiktok_vertical"
  | "youtube_thumbnail"
  | "whatsapp"
  | "reddit";

export interface PlatformPreset {
  id: PlatformFormat;
  label: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

export type EditorView =
  | "home"
  | "editor"
  | "templates"
  | "trending"
  | "batch"
  | "guides"
  | "guide"
  | "landing"
  | "about"
  | "privacy";

export interface TrendingMeme {
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

export interface TrendingData {
  memes: TrendingMeme[];
  trending: string[];
  generatedAt: string;
  sources: { imgflip: number; web: number };
}

export type CaptionTone =
  | "funny"
  | "sarcastic"
  | "relatable"
  | "dark"
  | "business"
  | "marketing"
  | "gaming"
  | "educational";

export interface MemeTemplate {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  description: string;
  width: number;
  height: number;
  panels: number;
  layout: "single" | "two_h" | "two_v" | "three_h" | "four_grid" | "before_after" | "expectation_reality";
  background: Background;
  layers: Array<Omit<TextLayer | ShapeLayer, "id" | "zIndex">>;
  premium?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CaptionPreset {
  id: string;
  label: string;
  structure: string;
  example: string;
}

export interface QualityIssue {
  level: "warning" | "error" | "info";
  title: string;
  description: string;
  layerId?: string;
}

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}
