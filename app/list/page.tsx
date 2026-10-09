"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Trash2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import MovieCard from "../../components/MovieCard";
import { useLiked } from "../../lib/useMovieList";

export default function MyListPage() {
  const { liked, remove, clear } = useLiked();

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 pt-24 md:pt-28 pb-32">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">My <span className="text-brand">List</span></h1>
            <p className="mt-1 text-white/50">{liked.length} {liked.length === 1 ? "movie" : "movies"} you swiped right on</p>
          </div>
          {liked.length > 0 && (
            <button
              onClick={() => { if (confirm("Remove all saved movies?")) clear(); }}
              className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm hover:!border-nope/50 hover:!text-nope"
            >
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>

        {liked.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-24 text-center">
            <p className="font-display text-3xl font-bold">Nothing here yet</p>
            <p className="mt-2 max-w-sm text-white/50">Swipe right on movies you want to watch and they&apos;ll show up here.</p>
            <Link href="/discover" className="btn-brand mt-8 inline-flex items-center gap-2 px-7 py-3.5"><Flame size={18} /> Start swiping</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {liked.map((m) => (
              <MovieCard key={m.id} movie={m} onRemove={remove} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
