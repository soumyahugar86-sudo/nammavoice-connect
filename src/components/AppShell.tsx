import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Search, ShieldCheck } from "lucide-react";
import { useLang, useT } from "@/lib/lang";

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang();
  const t = useT();
  const nav = [
    { to: "/", label: t("home"), icon: Home },
    { to: "/track", label: t("track"), icon: Search },
    { to: "/admin", label: t("admin"), icon: ShieldCheck },
  ] as const;
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg text-primary-foreground">🎙️</span>
            <span className="font-display text-xl font-extrabold">Namma<span className="text-primary">Voice</span></span>
          </Link>
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary" activeProps={{ className: "bg-secondary text-secondary-foreground" }}>{n.label}</Link>
            ))}
          </nav>
          <div role="group" aria-label="Language" className="flex rounded-full border bg-card p-1 text-sm font-bold">
            {(["en", "kn"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-full px-3 py-1 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l === "en" ? "EN" : "ಕನ್ನಡ"}</button>
            ))}
          </div>
        </div>
      </header>
      {children}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card/95 backdrop-blur md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" aria-hidden />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const cls = status === "resolved" ? "bg-success/15 text-success" : status === "in_progress" ? "bg-warning/20 text-foreground" : status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{label}</span>;
}
export function UrgencyBadge({ urgency }: { urgency: string }) {
  const cls = urgency === "critical" ? "bg-destructive text-destructive-foreground" : urgency === "high" ? "bg-destructive/15 text-destructive" : urgency === "medium" ? "bg-warning/20 text-foreground" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${cls}`}>{urgency}</span>;
}
