import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { complaintsQuery } from "@/lib/queries";
import { CATEGORIES, STATUSES, catOf } from "@/lib/complaints";
import { UrgencyBadge } from "@/components/AppShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — NammaVoice" },
      { name: "description", content: "Review civic complaints and update their status." },
      { property: "og:title", content: "Admin dashboard — NammaVoice" },
      { property: "og:description", content: "Review civic complaints and update their status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(complaintsQuery),
  component: Admin,
});

const URG = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;

function Admin() {
  const { data } = useSuspenseQuery(complaintsQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => data
    .filter((c) => (cat === "all" || c.category === cat) && (status === "all" || c.status === status))
    .filter((c) => !q || `${c.code} ${c.title} ${c.area} ${c.description}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (URG[a.urgency] ?? 9) - (URG[b.urgency] ?? 9)), [data, q, cat, status]);

  const update = async (id: string, s: string) => {
    const { error } = await supabase.from("complaints").update({ status: s, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Couldn't update status."); return; }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["complaints"] });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-extrabold">Admin dashboard</h1>
        <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-bold">Demo mode · no login required</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-card p-4">
            <p className="font-display text-3xl font-extrabold text-primary">{data.filter((c) => c.status === s.id).length}</p>
            <p className="text-xs font-semibold text-muted-foreground">{s.en}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-2 md:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, title, area…" aria-label="Search"
          className="flex-1 rounded-full border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category filter" className="rounded-full border bg-card px-4 py-2.5">
          <option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.en}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter" className="rounded-full border bg-card px-4 py-2.5">
          <option value="all">All statuses</option>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.en}</option>)}
        </select>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((c) => (
          <li key={c.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 md:flex-row md:items-center">
            {c.photo_url ? <img src={c.photo_url} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary text-2xl" aria-hidden>{catOf(c.category).icon}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-primary">{c.code}</span><UrgencyBadge urgency={c.urgency} /><span className="text-xs text-muted-foreground">{c.ai_source === "ai" ? "AI-analysed" : "Rule-analysed"}</span></div>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.summary}</p>
              <p className="text-xs text-muted-foreground">{catOf(c.category).en} · {c.area || "—"} · {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
            </div>
            <select value={c.status} onChange={(e) => update(c.id, e.target.value)} aria-label={`Status for ${c.code}`}
              className="rounded-full border bg-secondary px-4 py-2 text-sm font-bold">
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.en}</option>)}
            </select>
          </li>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No complaints match.</p>}
      </ul>
    </main>
  );
}
