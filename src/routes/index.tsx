import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NammaVoice — Report local issues" },
      { name: "description", content: "Report and upvote civic issues in your neighbourhood." },
      { property: "og:title", content: "NammaVoice — Report local issues" },
      { property: "og:description", content: "Report and upvote civic issues in your neighbourhood." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Issue = { id: string; title: string; area: string; category: string; votes: number; at: number };
const CATS = ["Roads", "Water", "Garbage", "Streetlights", "Other"];
const SEED: Issue[] = [
  { id: "1", title: "Big pothole near the bus stop", area: "Jayanagar 4th Block", category: "Roads", votes: 42, at: Date.now() - 864e5 },
  { id: "2", title: "No water supply for 3 days", area: "Hebbal", category: "Water", votes: 31, at: Date.now() - 1728e5 },
  { id: "3", title: "Garbage piling up on main road", area: "Koramangala", category: "Garbage", votes: 18, at: Date.now() - 36e5 },
];

function Index() {
  const [issues, setIssues] = useState<Issue[]>(SEED);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", area: "", category: "Roads" });

  useEffect(() => {
    const s = localStorage.getItem("nv-issues");
    if (s) setIssues(JSON.parse(s));
  }, []);
  const save = (next: Issue[]) => { setIssues(next); localStorage.setItem("nv-issues", JSON.stringify(next)); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.area.trim()) return;
    save([{ id: crypto.randomUUID(), ...form, votes: 1, at: Date.now() }, ...issues]);
    setForm({ title: "", area: "", category: form.category });
  };

  const shown = issues.filter((i) => filter === "All" || i.category === filter).sort((a, b) => b.votes - a.votes);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">ನಮ್ಮ ಧ್ವನಿ</p>
        <h1 className="mt-2 text-5xl font-extrabold md:text-6xl">NammaVoice</h1>
        <p className="mt-3 text-lg text-muted-foreground">Raise your voice for your neighbourhood. Report problems, upvote what matters.</p>
      </header>

      <form onSubmit={submit} className="mb-10 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Report an issue</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border bg-background px-3 py-2 md:col-span-2" placeholder="What's the problem?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-lg border bg-background px-3 py-2" placeholder="Area / locality" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          <select className="rounded-lg border bg-background px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="mt-4 rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground hover:opacity-90">Post issue</button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        {["All", ...CATS].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full border px-4 py-1 text-sm font-medium ${filter === c ? "bg-foreground text-background" : "bg-card"}`}>{c}</button>
        ))}
      </div>

      <ul className="space-y-3">
        {shown.map((i) => (
          <li key={i.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <button aria-label="Upvote" onClick={() => save(issues.map((x) => x.id === i.id ? { ...x, votes: x.votes + 1 } : x))} className="flex w-14 flex-col items-center rounded-xl bg-accent py-2 font-bold text-accent-foreground hover:opacity-90">
              ▲<span>{i.votes}</span>
            </button>
            <div>
              <p className="font-semibold">{i.title}</p>
              <p className="text-sm text-muted-foreground">{i.area} · {i.category}</p>
            </div>
          </li>
        ))}
        {shown.length === 0 && <p className="text-muted-foreground">No issues here yet.</p>}
      </ul>
    </main>
  );
}
