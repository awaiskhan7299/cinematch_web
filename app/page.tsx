"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Flame, Compass, Heart, Play, Bookmark } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieRow from "../components/MovieRow";
import { MovieLite, img, titleOf } from "../lib/movies";

const FALLBACK_BG = "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec8O31BfL0T.jpg";

const STEPS = [
  { icon: Compass, title: "Pick your mood", text: "Choose a genre or industry — Hollywood, Bollywood, Korean and more." },
  { icon: Heart, title: "Swipe", text: "Right to save, left to skip. No endless scrolling, no decision fatigue." },
  { icon: Play, title: "Watch tonight", text: "Open any match for the trailer, cast and where it's streaming." },
];

export default function Home() {
  const { data } = useQuery<MovieLite[]>({
    queryKey: ["hero-trending"],
    queryFn: async () => {
      const res = await fetch("/api/movies?type=trending");
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const heroes = (data ?? []).filter((m) => m.backdrop_path).slice(0, 5);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (heroes.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % heroes.length), 8000);
    return () => clearInterval(t);
  }, [heroes.length]);

  const hero = heroes[i];
  const backdrop = hero ? img(hero.backdrop_path, "original") : FALLBACK_BG;

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-[92dvh] items-center overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={backdrop}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url('${backdrop}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-6 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-md">
              <Flame size={14} /> Tinder, but for movies
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-black leading-[1.02] tracking-tight">
              Stop scrolling.<br /><span className="text-brand">Start matching.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/65 leading-relaxed">
              Swipe through movies picked for your mood. Save the ones you love and never wonder what to watch again.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/discover" className="btn-brand inline-flex items-center gap-2.5 px-8 py-4 text-base">
                <Flame size={20} /> Start swiping
              </Link>
              <Link href="/list" className="btn-ghost inline-flex items-center gap-2.5 px-7 py-4 text-base">
                <Bookmark size={18} /> My List
              </Link>
            </div>

            {hero && (
              <Link href={`/movie/${hero.id}`} className="mt-12 inline-flex max-w-full items-center gap-3 text-sm text-white/50 hover:text-white transition-colors">
                <span className="h-px w-8 bg-white/30" />
                <span className="truncate">Trending now: <span className="font-semibold text-white/80">{titleOf(hero)}</span></span>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-6 -mt-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, n) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: n * 0.1, duration: 0.6 }}
              className="glass-panel p-6"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient shadow-glow"><Icon size={20} /></div>
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROWS */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-6 pb-16 space-y-12">
        <MovieRow title="Trending Today" fetchUrl="/api/movies?type=trending" queryKey="trending" index={0} />
        <MovieRow title="Blockbuster Action" fetchUrl="/api/movies?genre=28" queryKey="action" index={1} />
        <MovieRow title="Bollywood Picks" fetchUrl="/api/movies?lang=hi" queryKey="bollywood" index={2} />
        <MovieRow title="Animation & Anime" fetchUrl="/api/movies?genre=16" queryKey="animation" index={3} />
        <MovieRow title="Sci-Fi & Fantasy" fetchUrl="/api/movies?genre=878,14" queryKey="scifi-fantasy" index={4} />
        <MovieRow title="Critically Acclaimed" fetchUrl="/api/movies?type=top_rated" queryKey="top-rated" index={5} />
      </div>

      <Footer />
    </main>
  );
}
