import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Camera, MapPin, Mic, Sparkles, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeComplaint } from "@/lib/ai.functions";
import { CATEGORIES, makeComplaintId, type Analysis, type Category } from "@/lib/complaints";
import { useLang, useT } from "@/lib/lang";
import { UrgencyBadge } from "./AppShell";

type SR = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null };

async function shrinkImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
  const scale = Math.min(1, 800 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.72);
}

export function ReportForm({ preset }: { preset?: Category | null }) {
  const { lang } = useLang();
  const t = useT();
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeComplaint);
  const [text, setText] = useState("");
  const [fromVoice, setFromVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<(Analysis & { source: string }) | null>(null);
  const [busy, setBusy] = useState<"analyze" | "submit" | "geo" | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    const w = window as any;
    setVoiceOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);
  useEffect(() => { if (preset && analysis) setAnalysis({ ...analysis, category: preset }); }, [preset]);

  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice input isn't supported in this browser. Please type instead (try Chrome for voice)."); return; }
    const rec: SR = new Ctor();
    rec.lang = lang === "kn" ? "kn-IN" : "en-IN";
    rec.interimResults = true; rec.continuous = true;
    const base = text ? text + " " : "";
    rec.onresult = (e) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setText(base + s); setFromVoice(true);
    };
    rec.onerror = (e) => { toast.error(e.error === "not-allowed" ? "Microphone permission denied." : `Voice error: ${e.error}`); };
    rec.onend = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error("Location not available. Please type your area."); return; }
    setBusy("geo");
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setBusy(null); },
      () => { toast.error("Couldn't get location. Please type your area."); setBusy(null); },
      { timeout: 10000 },
    );
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (f.size > 15e6) { toast.error("Image is too large (max 15 MB)."); return; }
    try { setPhoto(await shrinkImage(f)); } catch { toast.error("Couldn't read that image."); }
  };

  const runAnalysis = async () => {
    if (text.trim().length < 10) { toast.error("Please describe the problem in at least 10 characters."); return; }
    setBusy("analyze");
    try {
      const r = await analyze({ data: { text } });
      setAnalysis(preset ? { ...r, category: preset } : r);
    } catch { toast.error("Analysis failed. Please try again."); }
    setBusy(null);
  };

  const submit = async () => {
    if (!analysis) return;
    if (!area.trim() && !coords) { toast.error("Please add your area or location."); return; }
    setBusy("submit");
    const code = makeComplaintId();
    const { error } = await supabase.from("complaints").insert({
      code, title: analysis.title.slice(0, 120), description: text.trim().slice(0, 2000), summary: analysis.summary,
      category: analysis.category, urgency: analysis.urgency, area: area.trim() || null,
      latitude: coords?.lat ?? null, longitude: coords?.lng ?? null, photo_url: photo, language: lang, ai_source: analysis.source,
    });
    setBusy(null);
    if (error) { toast.error("Couldn't save your complaint. Please try again."); return; }
    qc.invalidateQueries({ queryKey: ["complaints"] });
    setDone(code);
    setText(""); setArea(""); setCoords(null); setPhoto(null); setAnalysis(null); setFromVoice(false);
  };

  if (done) return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-soft" role="status">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
      <h2 className="mt-3 text-2xl font-extrabold">{t("submitted")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("yourId")}</p>
      <p className="mt-1 font-mono text-3xl font-extrabold tracking-wider text-primary">{done}</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link to="/track" search={{ id: done }} className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">{t("trackBtn")}</Link>
        <button onClick={() => setDone(null)} className="rounded-full border px-5 py-2.5 font-bold">+ New</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 text-center text-hero-foreground shadow-soft md:p-10">
        <h1 className="text-3xl font-extrabold md:text-5xl">{t("tagline")}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-90 md:text-base">{t("heroSub")}</p>
        <div className="relative mx-auto mt-6 h-32 w-32">
          {listening && <span className="absolute inset-0 rounded-full bg-hero-foreground/40 animate-pulse-ring" aria-hidden />}
          <button onClick={toggleMic} aria-pressed={listening} aria-label={listening ? t("listening") : t("tapSpeak")}
            className="relative grid h-32 w-32 place-items-center rounded-full bg-card text-primary shadow-mic transition-transform hover:scale-105 active:scale-95">
            <Mic className="h-14 w-14" aria-hidden />
          </button>
        </div>
        <p className="mt-4 font-semibold" aria-live="polite">{listening ? t("listening") : t("tapSpeak")} · {lang === "kn" ? "ಕನ್ನಡ" : "English"}</p>
        {!voiceOk && <p className="mt-2 text-xs opacity-80">Voice input needs Chrome or Edge — you can still type below.</p>}
      </section>

      <section className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
        <label htmlFor="complaint" className="text-sm font-bold">{fromVoice ? t("transcript") : t("orType")}</label>
        <textarea id="complaint" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={4} placeholder={t("placeholder")}
          className="mt-2 w-full resize-none rounded-2xl border bg-background p-3 text-base focus:outline-none focus:ring-2 focus:ring-ring" />
        <input value={area} onChange={(e) => setArea(e.target.value)} maxLength={120} placeholder={t("area")} aria-label={t("area")}
          className="mt-2 w-full rounded-2xl border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <Camera className="h-4 w-4" aria-hidden />{t("photo")}
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          <button onClick={getLocation} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-secondary">
            {busy === "geo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" aria-hidden />}
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : t("location")}
          </button>
        </div>
        {photo && (
          <div className="relative mt-3 inline-block">
            <img src={photo} alt="Complaint photo preview" className="h-28 rounded-xl object-cover" />
            <button onClick={() => setPhoto(null)} aria-label="Remove photo" className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"><X className="h-3 w-3" /></button>
          </div>
        )}
        <button onClick={runAnalysis} disabled={busy !== null}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">
          {busy === "analyze" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" aria-hidden />}{t("analyze")}
        </button>

        {analysis && (
          <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-secondary/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{analysis.source === "ai" ? "AI analysis" : "Demo analysis (offline rules)"}</span>
              <UrgencyBadge urgency={analysis.urgency} />
            </div>
            <input value={analysis.title} onChange={(e) => setAnalysis({ ...analysis, title: e.target.value })} aria-label="Title"
              className="mt-2 w-full rounded-xl border bg-card p-2 font-bold" />
            <textarea value={analysis.summary} onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })} aria-label="Summary" rows={2}
              className="mt-2 w-full resize-none rounded-xl border bg-card p-2 text-sm" />
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setAnalysis({ ...analysis, category: c.id })} aria-pressed={analysis.category === c.id}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${analysis.category === c.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>{c.icon} {lang === "en" ? c.en : c.kn}</button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["low", "medium", "high", "critical"] as const).map((u) => (
                <button key={u} onClick={() => setAnalysis({ ...analysis, urgency: u })} aria-pressed={analysis.urgency === u}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${analysis.urgency === u ? "bg-foreground text-background" : "bg-card"}`}>{u}</button>
              ))}
            </div>
            <button onClick={submit} disabled={busy !== null}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-hero py-3 font-bold text-hero-foreground disabled:opacity-60">
              {busy === "submit" && <Loader2 className="h-5 w-5 animate-spin" />}{t("submit")}
            </button>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">Prototype: complaints are saved in NammaVoice only and are not sent to any government department.</p>
      </section>
    </div>
  );
}
