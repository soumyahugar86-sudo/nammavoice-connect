export type Category = "pothole" | "garbage" | "water" | "drainage" | "streetlight" | "other";
export type Urgency = "low" | "medium" | "high" | "critical";
export type Status = "submitted" | "in_progress" | "resolved" | "rejected";
export type Analysis = { category: Category; urgency: Urgency; title: string; summary: string };

export const CATEGORIES: { id: Category; en: string; kn: string; icon: string }[] = [
  { id: "pothole", en: "Pothole", kn: "ಗುಂಡಿ", icon: "🕳️" },
  { id: "garbage", en: "Garbage", kn: "ಕಸ", icon: "🗑️" },
  { id: "water", en: "Water leak", kn: "ನೀರು ಸೋರಿಕೆ", icon: "💧" },
  { id: "drainage", en: "Drainage", kn: "ಚರಂಡಿ", icon: "🌊" },
  { id: "streetlight", en: "Streetlight", kn: "ಬೀದಿ ದೀಪ", icon: "💡" },
  { id: "other", en: "Other", kn: "ಇತರೆ", icon: "📌" },
];
export const STATUSES: { id: Status; en: string; kn: string }[] = [
  { id: "submitted", en: "Submitted", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ" },
  { id: "in_progress", en: "In progress", kn: "ಪ್ರಗತಿಯಲ್ಲಿದೆ" },
  { id: "resolved", en: "Resolved", kn: "ಪರಿಹರಿಸಲಾಗಿದೆ" },
  { id: "rejected", en: "Rejected", kn: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ" },
];
export const catOf = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[5]!;

const KEYWORDS: [Category, string[]][] = [
  ["pothole", ["pothole", "road", "crack", "ಗುಂಡಿ", "ರಸ್ತೆ"]],
  ["garbage", ["garbage", "waste", "trash", "dump", "ಕಸ", "ತ್ಯಾಜ್ಯ"]],
  ["water", ["water", "leak", "pipe", "ನೀರು", "ಸೋರಿಕೆ", "ಪೈಪ್"]],
  ["drainage", ["drain", "sewage", "overflow", "ಚರಂಡಿ", "ಒಳಚರಂಡಿ"]],
  ["streetlight", ["light", "lamp", "dark", "ದೀಪ", "ಕತ್ತಲೆ"]],
];

/** Offline keyword-based fallback used when AI is unavailable (labelled "demo" in the UI). */
export function demoAnalyze(text: string): Analysis {
  const t = text.toLowerCase();
  const category = KEYWORDS.find(([, ws]) => ws.some((w) => t.includes(w)))?.[0] ?? "other";
  const urgency: Urgency = /danger|accident|urgent|child|ಅಪಾಯ|ತುರ್ತು/.test(t)
    ? "critical"
    : /days|week|ವಾರ|ದಿನ/.test(t) ? "high" : "medium";
  const label = catOf(category).en;
  return { category, urgency, title: `${label} issue reported`, summary: text.trim().slice(0, 160) || `${label} complaint` };
}

export function makeComplaintId(rand: () => number = Math.random): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(rand() * chars.length)];
  return `NV-${s}`;
}
