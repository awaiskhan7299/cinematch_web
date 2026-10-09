"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import SwipeDeck from "../../components/SwipeDeck";
import { GENRE_FILTERS, LANG_FILTERS, MovieLite, img } from "../../lib/movies";

function DiscoverInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const genre = sp.get("genre") ?? "";
  const lang = sp.get("lang") ?? "";
  const [active, setActive] = useState<MovieLite | null>(null);

  const setFilter = (key: "genre" | "lang", value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/discover?${qs}` : "/discover", { scroll: false });
  };

  const bg = img(active?.poster_path, "w500");

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* ambient blurred backdrop that follows the current card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-3xl transition-[background-image] duration-700"
        style={{ backgroundImage: bg ? `url('${bg}')` : undefined }}
      />
      {/* floating colour orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-[120px] animate-float" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-gold/15 blur-[140px] animate-float-slow" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      <Navbar />

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 md:pt-24 pb-28 md:pb-8">
        <div className="mb-3 text-center">
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight">
            What are you in the <span className="text-brand">mood</span> for?
          </h1>
          
        </div>

        <div className="mb-5 space-y-2 rounded-2xl border border-white/15 bg-white/[0.05] p-2.5 backdrop-blur-2xl shadow-glass">
          <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Genre">
            {GENRE_FILTERS.map((g) => (
              <button key={g.label} onClick={() => setFilter("genre", g.id)} className={`chip ${genre === g.id ? "chip-active" : ""}`}>{g.label}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Industry">
            {LANG_FILTERS.map((l) => (
              <button key={l.label} onClick={() => setFilter("lang", l.id)} className={`chip text-xs ${lang === l.id ? "chip-active" : ""}`}>{l.label}</button>
            ))}
          </div>
        </div>

        <SwipeDeck key={`${genre}|${lang}`} genre={genre} lang={lang} onActive={setActive} />
      </div>
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <DiscoverInner />
    </Suspense>
  );
}
