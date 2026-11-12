// Lightweight privacy-conscious analytics using localStorage accumulation.
// No third-party tracking. Users can clear their history at any time.

import type { AnalyticsEvent } from "./types";

const STORAGE_KEY = "memeforge:analytics";
const SESSION_KEY = "memeforge:session";
const CONSENT_KEY = "memeforge:analytics-consent";

export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) !== "disabled";
}

export function setAnalyticsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, enabled ? "enabled" : "disabled");
}

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  if (!analyticsEnabled()) return;
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    items.push({ ...event, ts: Date.now() });
    // keep last 500 events
    const trimmed = items.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
  // Dispatch a custom event for in-page UI
  window.dispatchEvent(new CustomEvent("memeforge:analytics", { detail: event }));
}

export function getEvents(limit = 100): Array<AnalyticsEvent & { ts: number }> {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return items.slice(-limit);
  } catch {
    return [];
  }
}

export function clearAnalytics() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// Convenience event trackers
export const trackPageView = (path: string) => track({ name: "page_view", props: { path } });
export const trackCreateMeme = () => track({ name: "create_meme_click" });
export const trackTemplateSelect = (templateId: string) =>
  track({ name: "template_select", props: { templateId } });
export const trackImageUpload = () => track({ name: "image_upload" });
export const trackTextAdd = () => track({ name: "text_add" });
export const trackExport = (format: string, width: number, height: number) =>
  track({ name: "export_success", props: { format, width, height } });
export const trackExportAttempt = (format: string) =>
  track({ name: "export_attempt", props: { format } });
export const trackBatchExport = (count: number) =>
  track({ name: "batch_export", props: { count } });
export const trackCaptionGenerate = (tone: string) =>
  track({ name: "caption_generate", props: { tone } });
export const trackError = (message: string) =>
  track({ name: "tool_error", props: { message: message.slice(0, 200) } });

// Aggregated metrics derived from stored events
export interface Metrics {
  pageViews: number;
  createClicks: number;
  templateSelections: number;
  imageUploads: number;
  textAdds: number;
  exportAttempts: number;
  exportSuccesses: number;
  batchExports: number;
  captionGenerations: number;
  errors: number;
  homepageToEditor: number;
  editorToDownload: number;
}

export function computeMetrics(): Metrics {
  const events = getEvents(2000);
  const m: Metrics = {
    pageViews: 0,
    createClicks: 0,
    templateSelections: 0,
    imageUploads: 0,
    textAdds: 0,
    exportAttempts: 0,
    exportSuccesses: 0,
    batchExports: 0,
    captionGenerations: 0,
    errors: 0,
    homepageToEditor: 0,
    editorToDownload: 0,
  };
  for (const e of events) {
    switch (e.name) {
      case "page_view": m.pageViews++; break;
      case "create_meme_click": m.createClicks++; break;
      case "template_select": m.templateSelections++; break;
      case "image_upload": m.imageUploads++; break;
      case "text_add": m.textAdds++; break;
      case "export_attempt": m.exportAttempts++; break;
      case "export_success": m.exportSuccesses++; break;
      case "batch_export": m.batchExports++; break;
      case "caption_generate": m.captionGenerations++; break;
      case "tool_error": m.errors++; break;
    }
  }
  // Funnel
  m.homepageToEditor = m.createClicks > 0 && m.pageViews > 0 ? m.createClicks : 0;
  m.editorToDownload = m.exportSuccesses;
  return m;
}
