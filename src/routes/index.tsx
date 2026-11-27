import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { complaintsQuery } from "@/lib/queries";
import { CATEGORIES, type Category } from "@/lib/complaints";
import { useLang, useT } from "@/lib/lang";
import { ReportForm } from "@/components/ReportForm";
import { ComplaintCard } from "@/components/ComplaintCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NammaVoice — Report civic issues by voice" },
      { name: "description", content: "Report potholes, garbage, water leaks, drainage and streetlight problems in Kannada or English." },
      { property: "og:title", content: "NammaVoice — Report civic issues by voice" },
      { property: "og:description", content: "Speak or type a civic complaint in Kannada or English and track it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(complaintsQuery),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(complaintsQuery);
  const { lang } = useLang();
  const t = useT();
  const [preset, setPreset] = useState<Category | null>(null);
  const stats = [
    { label: t("total"), value: data.length },
    { label: t("open"), value: data.filter((c) => c.status === "submitted" || c.status === "in_progress").length },
    { label: t("resolved"), value: data.filter((c) => c.status === "resolved").length },
  ];
  return (
    <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1.2fr_1fr]">
      <div className="min-w-0 space-y-6">
        <ReportForm preset={preset} />
      </div>
      <div className="min-w-0 space-y-6">
        <section aria-label="Statistics" className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-4 text-center shadow-sm">
              <p className="font-display text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold">{t("categories")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const n = data.filter((x) => x.category === c.id).length;
              return (
                <button key={c.id} onClick={() => setPreset(preset === c.id ? null : c.id)} aria-pressed={preset === c.id}
                  className={`rounded-2xl border p-3 text-center transition ${preset === c.id ? "border-primary bg-secondary" : "bg-card hover:bg-secondary/60"}`}>
                  <span className="text-2xl" aria-hidden>{c.icon}</span>
                  <p className="mt-1 text-xs font-bold">{lang === "en" ? c.en : c.kn}</p>
                  <p className="text-[11px] text-muted-foreground">{n}</p>
                </button>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold">{t("recent")}</h2>
          <div className="space-y-3">{data.slice(0, 5).map((c) => <ComplaintCard key={c.id} c={c} />)}</div>
        </section>
      </div>
    </main>
  );
}
