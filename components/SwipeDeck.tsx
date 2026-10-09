"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Undo2, Info, Star, RefreshCw, Bookmark } from "lucide-react";
import { GENRES, MovieLite, img, titleOf, yearOf } from "../lib/movies";
import { readSeenIds, useLiked, useSeen } from "../lib/useMovieList";

type Dir = 1 | -1;
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

/* ───────────────────────── Card ───────────────────────── */

function RatingRing({ value }: { value: number }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 10) * 10);
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--color-gold) ${pct * 3.6}deg, rgba(255,255,255,0.18) 0deg)` }}
      aria-label={`Rating ${value.toFixed(1)} out of 10`}
    >
      <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-black/80 text-xs font-bold">
        {value.toFixed(1)}
      </div>
    </div>
  );
}

function CardBody({ movie, expanded }: { movie: MovieLite; expanded: boolean }) {
  const genres = (movie.genre_ids ?? []).map((g) => GENRES[g]).filter(Boolean).slice(0, 3);
  const year = yearOf(movie);
  const rating = movie.vote_average ?? 0;
  return (
    <>
      <img
        src={img(movie.poster_path, "w780")}
        alt={titleOf(movie)}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
      />
      {/* glossy top sheen + soft bottom shade */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      {/* poster blurs behind the details when info is open */}
      <div className={`absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-500 pointer-events-none ${expanded ? "opacity-100" : "opacity-0"}`} />

      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/20 bg-black/30 p-3.5 backdrop-blur-xl pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_-12px_rgba(0,0,0,0.9)]">
        <h2 className={expanded ? "mb-2.5 font-display text-xl font-bold leading-tight" : "sr-only"}>{titleOf(movie)}</h2>

        <div className="flex items-center gap-3">
          {rating > 0 && <RatingRing value={rating} />}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/90">{year || "—"}</p>
            <p className="truncate text-xs text-white/60">{genres.join(" · ") || "Movie"}</p>
          </div>
        </div>

        <p className={`mt-2.5 text-[13px] leading-relaxed text-white/75 ${expanded ? "max-h-36 overflow-y-auto pointer-events-auto no-scrollbar" : "line-clamp-2"}`}>
          {movie.overview || "No description available."}
        </p>

        {expanded && (
          <Link href={`/movie/${movie.id}`} className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
            Full details, cast & where to watch →
          </Link>
        )}
      </div>
    </>
  );
}

const exitVariants = {
  exit: (d: Dir) => ({
    x: d * 700,
    rotate: d * 24,
    opacity: 0,
    zIndex: 50,
    transition: { duration: 0.35, ease: [0.4, 0, 0.8, 0.4] as [number, number, number, number] },
  }),
};

function TopCard({
  movie, dir, expanded, onSwipe,
}: { movie: MovieLite; dir: Dir; expanded: boolean; onSwipe: (d: Dir) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0]);
  const glow = useTransform(
    x,
    [-200, 0, 200],
    ["0 0 60px -10px rgba(255,77,109,0.8)", "0 25px 60px -15px rgba(0,0,0,0.9)", "0 0 60px -10px rgba(46,229,157,0.8)"]
  );

  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onSwipe(1);
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onSwipe(-1);
  };

  return (
    <motion.div
      key={movie.id}
      custom={dir}
      variants={exitVariants}
      initial={{ scale: 0.94, y: 16 }}
      animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } }}
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={onDragEnd}
      style={{ x, rotate, boxShadow: glow, zIndex: 10 }}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/20 bg-[#111] cursor-grab touch-pan-y"
    >
      <CardBody movie={movie} expanded={expanded} />

      <motion.div style={{ opacity: likeOpacity }} className="absolute left-6 top-8 -rotate-12 rounded-xl border-4 border-like px-4 py-1 text-3xl font-black tracking-widest text-like pointer-events-none">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute right-6 top-8 rotate-12 rounded-xl border-4 border-nope px-4 py-1 text-3xl font-black tracking-widest text-nope pointer-events-none">
        NOPE
      </motion.div>
    </motion.div>
  );
}

function BackCard({ movie, depth }: { movie: MovieLite; depth: 1 | 2 }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#111]"
      style={{ transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`, opacity: 1 - depth * 0.25, zIndex: 5 - depth }}
    >
      <img src={img(movie.poster_path, "w500")} alt="" draggable={false} className="h-full w-full object-cover brightness-50" />
    </div>
  );
}

/* ───────────────────────── Deck ───────────────────────── */

type Props = {
  genre?: string;
  lang?: string;
  onActive?: (m: MovieLite | null) => void;
};

export default function SwipeDeck({ genre = "", lang = "", onActive }: Props) {
  const { add, remove } = useLiked();
  const { markSeen, unmarkSeen, clearSeen } = useSeen();

  const [queue, setQueue] = useState<MovieLite[]>([]);
  const [history, setHistory] = useState<{ movie: MovieLite; dir: Dir }[]>([]);
  const [dir, setDir] = useState<Dir>(1);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);

  const queueRef = useRef<MovieLite[]>([]);
  const historyRef = useRef<{ movie: MovieLite; dir: Dir }[]>([]);
  const pageRef = useRef(1);
  const started = useRef(false);
  const fetching = useRef(false);
  const alive = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  /* keep the queue topped up (the deck is re-mounted via `key` when filters change) */
  useEffect(() => {
    if (queue.length >= 5 || error || exhausted || fetching.current) return;
    fetching.current = true;
    if (!started.current) {
      started.current = true;
      pageRef.current = 1 + Math.floor(Math.random() * 4); // fresh picks every visit
    }
    const params = new URLSearchParams({ type: "discover", page: String(pageRef.current) });
    if (genre) params.set("genre", genre);
    if (lang) params.set("lang", lang);

    fetch(`/api/movies?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("bad response");
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("bad data");
        return data as MovieLite[];
      })
      .then((data) => {
        if (!alive.current) return;
        pageRef.current += 1;
        if (data.length === 0 || pageRef.current > 40) setExhausted(true);
        const seen = readSeenIds();
        setQueue((q) => {
          const have = new Set(q.map((m) => m.id));
          const fresh = data.filter((m) => m.poster_path && !seen.has(m.id) && !have.has(m.id));
          return [...q, ...fresh];
        });
      })
      .catch(() => {
        if (alive.current) setError(true);
      })
      .finally(() => {
        fetching.current = false;
        if (alive.current) setTick((t) => t + 1);
      });
  }, [queue.length, tick, error, exhausted, genre, lang]);

  const top = queue[0];
  useEffect(() => { onActive?.(top ?? null); }, [top?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const swipe = useCallback((d: Dir) => {
    const current = queueRef.current[0];
    if (!current) return;
    setDir(d);
    setExpanded(false);
    setQueue((q) => q.slice(1));
    historyRef.current = [...historyRef.current.slice(-19), { movie: current, dir: d }];
    setHistory(historyRef.current);
    markSeen(current.id);
    if (d === 1) {
      add(current);
      flash(`Saved “${titleOf(current)}” to My List`);
    }
  }, [add, markSeen]);

  const undo = useCallback(() => {
    const last = historyRef.current[historyRef.current.length - 1];
    if (!last) return;
    historyRef.current = historyRef.current.slice(0, -1);
    setHistory(historyRef.current);
    if (last.dir === 1) remove(last.movie.id);
    unmarkSeen(last.movie.id);
    setExpanded(false);
    setQueue((q) => [last.movie, ...q.filter((m) => m.id !== last.movie.id)]);
  }, [remove, unmarkSeen]);

  /* keyboard: ← pass, → like, Z undo, I info */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") swipe(-1);
      else if (e.key === "ArrowRight") swipe(1);
      else if (e.key.toLowerCase() === "z") undo();
      else if (e.key.toLowerCase() === "i") setExpanded((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, undo]);

  const resetAll = () => {
    clearSeen();
    pageRef.current = 1 + Math.floor(Math.random() * 4);
    historyRef.current = [];
    setHistory([]);
    setExhausted(false);
    setError(false);
    setQueue([]);
    setTick((t) => t + 1);
  };

  const retry = () => { setError(false); setTick((t) => t + 1); };

  /* ───── render ───── */
  const frame = "deck-frame relative mx-auto";

  const empty = !top && (exhausted || error);

  return (
    <div className="flex flex-col items-center">
      <div className={frame}>
        {top ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-0 rounded-[48px] bg-cover bg-center opacity-60 blur-3xl transition-[background-image] duration-700"
              style={{ backgroundImage: `url('${img(top.poster_path, "w200")}')` }}
            />
            {queue[2] && <BackCard movie={queue[2]} depth={2} />}
            {queue[1] && <BackCard movie={queue[1]} depth={1} />}
            <AnimatePresence custom={dir}>
              <TopCard key={top.id} movie={top} dir={dir} expanded={expanded} onSwipe={swipe} />
            </AnimatePresence>
          </>
        ) : empty ? (
          <div className="absolute inset-0 grid place-items-center rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center">
            {error ? (
              <div>
                <p className="font-display text-2xl font-bold">Couldn&apos;t load movies</p>
                <p className="mt-2 text-sm text-white/50">Check your internet and your TMDB_API_KEY in .env.local</p>
                <button onClick={retry} className="btn-brand mt-6 inline-flex items-center gap-2 px-6 py-3"><RefreshCw size={16} /> Try again</button>
              </div>
            ) : (
              <div>
                <p className="font-display text-2xl font-bold">You&apos;ve seen them all 🎬</p>
                <p className="mt-2 text-sm text-white/50">Try another genre or industry — or reset and swipe again.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={resetAll} className="btn-brand inline-flex items-center gap-2 px-6 py-3"><RefreshCw size={16} /> Reset deck</button>
                  <Link href="/list" className="btn-ghost inline-flex items-center gap-2 px-6 py-3"><Bookmark size={16} /> My List</Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 skeleton-shimmer rounded-[28px]" />
        )}
      </div>

      {/* Action buttons */}
      <div className="relative z-10 mt-6 flex items-center justify-center gap-3 sm:gap-4 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-2xl shadow-glass">
        <button onClick={undo} disabled={history.length === 0} aria-label="Undo last swipe" title="Undo (Z)"
          className="glass-btn h-11 w-11 text-gold hover:bg-white/20">
          <Undo2 size={19} />
        </button>
        <button onClick={() => swipe(-1)} disabled={!top} aria-label="Pass" title="Pass (←)"
          className="glass-btn h-16 w-16 text-nope hover:bg-nope hover:text-white hover:scale-110 hover:shadow-[0_0_32px_-4px_rgba(255,77,109,0.8)]">
          <X size={30} strokeWidth={3} />
        </button>
        <button onClick={() => setExpanded((v) => !v)} disabled={!top} aria-label="More info" title="Info (I)" aria-pressed={expanded}
          className={`glass-btn h-11 w-11 ${expanded ? "!bg-white !text-black" : "text-white hover:bg-white/20"}`}>
          <Info size={19} />
        </button>
        <button onClick={() => swipe(1)} disabled={!top} aria-label="Like" title="Like (→)"
          className="glass-btn h-16 w-16 text-like hover:bg-like hover:text-black hover:scale-110 hover:shadow-[0_0_32px_-4px_rgba(46,229,157,0.8)]">
          <Heart size={28} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
      <p className="mt-3 hidden md:block text-xs text-white/30">
        <kbd className="rounded bg-white/10 px-1.5 py-0.5">←</kbd> pass &nbsp; <kbd className="rounded bg-white/10 px-1.5 py-0.5">→</kbd> like &nbsp; <kbd className="rounded bg-white/10 px-1.5 py-0.5">Z</kbd> undo &nbsp; <kbd className="rounded bg-white/10 px-1.5 py-0.5">I</kbd> info
      </p>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 z-[70] -translate-x-1/2 flex items-center gap-3 rounded-full glass-panel bg-background/90 px-5 py-3 text-sm"
          >
            <Star size={16} className="text-gold" fill="currentColor" />
            <span className="max-w-[60vw] truncate">{toast.text}</span>
            <Link href="/list" className="font-semibold text-gold hover:underline">View</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
