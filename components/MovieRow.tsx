"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { MovieLite } from "../lib/movies";

type MovieRowProps = {
  title: string;
  fetchUrl: string;
  queryKey: string;
  index?: number;
  /** optional movies to render instead of fetching (e.g. similar movies) */
  movies?: MovieLite[];
};

const ITEM = "w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0 snap-start";

export default function MovieRow({ title, fetchUrl, queryKey, index = 0, movies: preset }: MovieRowProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useQuery<MovieLite[]>({
    queryKey: ["row", queryKey, fetchUrl],
    enabled: !preset,
    queryFn: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Network error");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const movies = (preset ?? data ?? []).filter((m) => m.poster_path);
  const loading = !preset && isLoading;

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 3) * 0.05 }}
      className="w-full"
    >
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button aria-label="Scroll left" onClick={() => scrollBy(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button aria-label="Scroll right" onClick={() => scrollBy(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isError && !preset ? (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-white/60">
          Couldn&apos;t load this row.
          <button onClick={() => refetch()} className="btn-ghost px-4 py-1.5 text-sm">Retry</button>
        </div>
      ) : (
        <div ref={scroller} className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-4 pt-2 -mx-1 px-1 snap-x snap-mandatory">
          {loading && [...Array(8)].map((_, i) => <div key={i} className={`${ITEM} aspect-[2/3] skeleton-shimmer`} />)}
          {movies.map((m) => (
            <div key={m.id} className={ITEM}>
              <MovieCard movie={m} />
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
