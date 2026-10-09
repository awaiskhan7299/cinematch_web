"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Heart, MonitorPlay, Play, Star, User, X } from "lucide-react";
import Navbar from "../../../components/Navbar";
import MovieRow from "../../../components/MovieRow";
import Footer from "../../../components/Footer";
import { type MovieDetails as MovieData, img } from "../../../lib/movies";
import { useLiked } from "../../../lib/useMovieList";

export default function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { has, toggle } = useLiked();

  const { data: movie, isLoading, isError } = useQuery<MovieData>({
    queryKey: ["movie-details", id],
    queryFn: async () => {
      const res = await fetch(`/api/movie/${id}`);
      if (!res.ok) throw new Error(res.status === 404 ? "not-found" : "failed");
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1200px] px-6 pt-32 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 aspect-[2/3] skeleton-shimmer" />
          <div className="flex-1 space-y-5">
            <div className="h-14 w-3/4 skeleton-shimmer" />
            <div className="h-6 w-1/2 skeleton-shimmer" />
            <div className="h-40 w-full skeleton-shimmer" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !movie) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="grid min-h-dvh place-items-center px-6 text-center">
          <div>
            <p className="font-display text-4xl font-black">Movie not found</p>
            <p className="mt-2 text-white/50">It may have been removed, or the request failed.</p>
            <Link href="/discover" className="btn-brand mt-8 inline-flex px-7 py-3.5">Back to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  const title: string = movie.title || movie.name || "Untitled";
  const runtime = movie.runtime ?? 0;
  const rating = movie.vote_average ?? 0;
  const backdrop = img(movie.backdrop_path, "original");
  const poster = img(movie.poster_path, "w780");
  const liked = has(movie.id);
  const year = (movie.release_date || "").slice(0, 4);
  const lite = {
    id: movie.id, title, poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average, release_date: movie.release_date, overview: movie.overview,
    genre_ids: (movie.genres ?? []).map((g) => g.id),
  };

  return (
    <main className="relative min-h-dvh bg-background overflow-x-hidden">
      <Navbar />

      <div className="absolute inset-x-0 top-0 z-0 h-[85vh]">
        {backdrop && <div className="absolute inset-0 bg-cover bg-top opacity-60" style={{ backgroundImage: `url('${backdrop}')` }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-6 pt-24 md:pt-28 pb-32">
        <Link href="/discover" className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="w-3/4 max-w-xs mx-auto md:mx-0 md:w-1/3 md:max-w-none shrink-0"
          >
            {poster ? (
              <img src={poster} alt={title} className="w-full rounded-3xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" />
            ) : (
              <div className="aspect-[2/3] rounded-3xl bg-white/5" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {(movie.genres ?? []).map((g) => (
                <Link key={g.id} href={`/discover?genre=${g.id}`} className="chip text-xs">{g.name}</Link>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05] tracking-tight">{title}</h1>
            {movie.tagline && <p className="mt-3 text-lg italic text-white/45">&ldquo;{movie.tagline}&rdquo;</p>}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/75">
              {year && <span className="flex items-center gap-2"><Calendar size={16} className="text-accent" /> {year}</span>}
              {runtime > 0 && <span className="flex items-center gap-2"><Clock size={16} className="text-accent" /> {Math.floor(runtime / 60)}h {runtime % 60}m</span>}
              {rating > 0 && <span className="flex items-center gap-2"><Star size={16} className="text-gold" fill="currentColor" /> {rating.toFixed(1)} <span className="text-white/35">({movie.vote_count?.toLocaleString()})</span></span>}
            </div>

            <p className="mt-7 max-w-2xl text-base md:text-lg leading-relaxed text-white/70">{movie.overview || "No description available."}</p>
            {movie.director && <p className="mt-4 text-sm text-white/45">Directed by <span className="text-white/80 font-medium">{movie.director}</span></p>}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {movie.trailerKey && (
                <button onClick={() => setTrailerOpen(true)} className="btn-brand inline-flex items-center gap-2.5 px-7 py-3.5">
                  <Play size={18} fill="currentColor" /> Watch trailer
                </button>
              )}
              <button
                onClick={() => toggle(lite)}
                aria-pressed={liked}
                className={`btn-ghost inline-flex items-center gap-2.5 px-6 py-3.5 ${liked ? "!border-accent/60 !text-accent" : ""}`}
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} /> {liked ? "In My List" : "Add to My List"}
              </button>
            </div>

            {(movie.streamingProviders?.length ?? 0) > 0 && (
              <div className="mt-10 glass-panel p-5 self-start">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  <MonitorPlay size={15} /> Where to watch {movie.providerRegion && <span className="text-white/30">· {movie.providerRegion}</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {(movie.streamingProviders ?? []).slice(0, 6).map((p) => (
                    <a
                      key={p.provider_id}
                      href={movie.providerLink || undefined}
                      target="_blank" rel="noopener noreferrer"
                      title={p.provider_name}
                      className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 transition-transform hover:scale-110"
                    >
                      <img src={img(p.logo_path, "w200")} alt={p.provider_name} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {(movie.cast?.length ?? 0) > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 font-display text-2xl md:text-3xl font-bold">Top cast</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {(movie.cast ?? []).map((c) => (
                <div key={c.credit_id || c.id} className="w-[110px] shrink-0 text-center">
                  <div className="aspect-square overflow-hidden rounded-full border border-white/10 bg-white/5 grid place-items-center">
                    {c.profile_path ? <img src={img(c.profile_path, "w200")} alt={c.name} loading="lazy" className="h-full w-full object-cover" /> : <User className="text-white/25" size={32} />}
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-white/85">{c.name}</p>
                  <p className="truncate text-xs text-white/40">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(movie.similar?.length ?? 0) > 0 && (
          <section className="mt-16">
            <MovieRow title="You might also like" fetchUrl="" queryKey={`similar-${movie.id}`} movies={movie.similar ?? []} />
          </section>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {trailerOpen && movie.trailerKey && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setTrailerOpen(false)}
          >
            <button aria-label="Close trailer" className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" onClick={() => setTrailerOpen(false)}>
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-4xl aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                title={`${title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
