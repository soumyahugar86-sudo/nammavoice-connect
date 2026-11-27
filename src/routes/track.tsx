import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";
import { complaintsQuery } from "@/lib/queries";
import { catOf, STATUSES } from "@/lib/complaints";
import { useLang, useT } from "@/lib/lang";
import { UrgencyBadge } from "@/components/AppShell";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s["id"] === "string" ? { id: s["id"] } : {}),
  head: () => ({
    meta: [
      { title: "Track complaint — NammaVoice" },
      { name: "description", content: "Check the status of your NammaVoice complaint with its ID." },
      { property: "og:title", content: "Track complaint — NammaVoice" },
      { property: "og:description", content: "Check the status of your civic complaint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(complaintsQuery),
  component: Track,
});

const STEPS = ["submitted", "in_progress", "resolved"] as const;

function Track() {
  const { id } = Route.useSearch();
  const nav = useNavigate({ from: "/track" });
  const { data } = useSuspenseQuery(complaintsQuery);
  const { lang } = useLang();
  const t = useT();
  const [q, setQ] = useState(id ?? "");
  const c = id ? data.find((x) => x.code.toUpperCase() === id.trim().toUpperCase()) : undefined;
  const idx = c ? STEPS.indexOf(c.status as (typeof STEPS)[number]) : -1;
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">{t("trackTitle")}</h1>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); nav({ search: q.trim() ? { id: q.trim().toUpperCase() } : {} }); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="NV-24A7K3" aria-label="Complaint ID"
          className="flex-1 rounded-full border bg-card px-4 py-3 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
        <button className="rounded-full bg-primary px-6 font-bold text-primary-foreground">{t("trackBtn")}</button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">Try a sample: <button className="font-mono underline" onClick={() => { setQ("NV-24A7K3"); nav({ search: { id: "NV-24A7K3" } }); }}>NV-24A7K3</button></p>

      {id && !c && <p className="mt-6 rounded-2xl border bg-card p-4 text-destructive" role="alert">{t("notFound")}</p>}
      {c && (
        <article className="mt-6 overflow-hidden rounded-3xl border bg-card shadow-soft">
          {c.photo_url && <img src={c.photo_url} alt="Complaint photo" className="h-52 w-full object-cover" />}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-primary">{c.code}</span><UrgencyBadge urgency={c.urgency} />
            </div>
            <h2 className="mt-2 text-2xl font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{catOf(c.category).icon} {lang === "en" ? catOf(c.category).en : catOf(c.category).kn} · {c.area || (c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude?.toFixed(4)}` : "—")}</p>
            {c.summary && <p className="mt-3 rounded-xl bg-secondary p-3 text-sm">{c.summary}</p>}
            <p className="mt-3 text-sm">{c.description}</p>
            {c.status === "rejected" ? (
              <p className="mt-6 rounded-xl bg-destructive/10 p-3 font-bold text-destructive">{lang === "en" ? "Rejected" : "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ"}</p>
            ) : (
              <ol className="mt-6 flex items-start">
                {STEPS.map((s, i) => {
                  const st = STATUSES.find((x) => x.id === s)!;
                  const on = i <= idx;
                  return (
                    <li key={s} className="flex flex-1 flex-col items-center text-center">
                      <div className="flex w-full items-center">
                        <div className={`h-1 flex-1 ${i === 0 ? "opacity-0" : on ? "bg-primary" : "bg-border"}`} />
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{on ? <Check className="h-5 w-5" /> : i + 1}</span>
                        <div className={`h-1 flex-1 ${i === 2 ? "opacity-0" : i < idx ? "bg-primary" : "bg-border"}`} />
                      </div>
                      <span className="mt-2 text-xs font-semibold">{lang === "en" ? st.en : st.kn}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Filed {new Date(c.created_at).toLocaleString("en-IN")} · Updated {new Date(c.updated_at).toLocaleString("en-IN")}</p>
          </div>
        </article>
      )}
    </main>
  );
}
