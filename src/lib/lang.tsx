import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
export type Lang = "en" | "kn";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("en");
  useEffect(() => { const s = localStorage.getItem("nv-lang"); if (s === "kn" || s === "en") setL(s); }, []);
  const setLang = (l: Lang) => { setL(l); localStorage.setItem("nv-lang", l); };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
const T = {
  home: ["Home", "ಮುಖಪುಟ"], track: ["Track", "ಹುಡುಕಿ"], admin: ["Admin", "ನಿರ್ವಾಹಕ"],
  tagline: ["Your city. Your voice.", "ನಿಮ್ಮ ನಗರ. ನಿಮ್ಮ ಧ್ವನಿ."],
  heroSub: ["Tap the mic and tell us what's wrong. We'll route it to the right department.", "ಮೈಕ್ ಒತ್ತಿ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ. ನಾವು ಸರಿಯಾದ ಇಲಾಖೆಗೆ ಕಳುಹಿಸುತ್ತೇವೆ."],
  tapSpeak: ["Tap to speak", "ಮಾತನಾಡಲು ಒತ್ತಿ"], listening: ["Listening… tap to stop", "ಕೇಳುತ್ತಿದೆ… ನಿಲ್ಲಿಸಲು ಒತ್ತಿ"],
  orType: ["Or type your complaint", "ಅಥವಾ ನಿಮ್ಮ ದೂರನ್ನು ಬರೆಯಿರಿ"],
  placeholder: ["e.g. Big pothole near the bus stand on MG Road…", "ಉದಾ: ಎಂ.ಜಿ ರಸ್ತೆಯ ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ದೊಡ್ಡ ಗುಂಡಿ…"],
  categories: ["Categories", "ವರ್ಗಗಳು"], recent: ["Recent complaints", "ಇತ್ತೀಚಿನ ದೂರುಗಳು"],
  total: ["Total", "ಒಟ್ಟು"], open: ["Open", "ಬಾಕಿ"], resolved: ["Resolved", "ಪರಿಹಾರ"],
  photo: ["Add photo", "ಫೋಟೋ ಸೇರಿಸಿ"], location: ["Add location", "ಸ್ಥಳ ಸೇರಿಸಿ"], area: ["Area / landmark", "ಪ್ರದೇಶ / ಹೆಗ್ಗುರುತು"],
  analyze: ["Analyse with AI", "AI ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ"], submit: ["Submit complaint", "ದೂರು ಸಲ್ಲಿಸಿ"],
  submitted: ["Complaint submitted!", "ದೂರು ಸಲ್ಲಿಸಲಾಗಿದೆ!"], yourId: ["Your complaint ID", "ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ"],
  trackTitle: ["Track your complaint", "ನಿಮ್ಮ ದೂರನ್ನು ಹುಡುಕಿ"], trackBtn: ["Track", "ಹುಡುಕಿ"],
  notFound: ["No complaint found with that ID.", "ಈ ಸಂಖ್ಯೆಯ ದೂರು ಸಿಗಲಿಲ್ಲ."],
  transcript: ["Recognised speech — edit if needed", "ಗುರುತಿಸಿದ ಮಾತು — ಬೇಕಾದರೆ ತಿದ್ದಿ"],
} as const;
export function useT() {
  const { lang } = useLang();
  return (k: keyof typeof T) => T[k][lang === "en" ? 0 : 1];
}
