import { catOf, STATUSES } from "@/lib/complaints";
import type { Complaint } from "@/lib/queries";
import { useLang } from "@/lib/lang";
import { StatusBadge, UrgencyBadge } from "./AppShell";

export function ComplaintCard({ c }: { c: Complaint }) {
  const { lang } = useLang();
  const cat = catOf(c.category);
  const st = STATUSES.find((s) => s.id === c.status);
  return (
    <article className="flex gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      {c.photo_url ? <img src={c.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" /> :
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-secondary text-2xl" aria-hidden>{cat.icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
          <StatusBadge status={c.status} label={st ? (lang === "en" ? st.en : st.kn) : c.status} />
          <UrgencyBadge urgency={c.urgency} />
        </div>
        <h3 className="mt-1 truncate font-sans text-base font-bold">{c.title}</h3>
        <p className="truncate text-sm text-muted-foreground">{lang === "en" ? cat.en : cat.kn} · {c.area || "—"} · {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
      </div>
    </article>
  );
}
