"use client";

import { motion } from "framer-motion";
import { Heart, Star, X } from "lucide-react";
import Link from "next/link";
import { MovieLite, img, titleOf, yearOf } from "../lib/movies";
import { useLiked } from "../lib/useMovieList";

type Props = {
  movie: MovieLite;
  /** show a remove (X) button instead of the heart – used on My List */
  onRemove?: (id: number) => void;
};

export default function MovieCard({ movie, onRemove }: Props) {
  const { has, toggle } = useLiked();
  const liked = has(movie.id);
  const title = titleOf(movie);
  const rating = movie.vote_average ?? 0;

  return (
    <div className="group relative w-full">
      <Link href={`/movie/${movie.id}`} className="block">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl group-hover:shadow-glow group-hover:border-white/25 transition-shadow duration-500"
        >
          {movie.poster_path ? (
            <img
              src={img(movie.poster_path, "w500")}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-sm p-4 text-center">{title}</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          {rating > 0 && (
            <span className="absolute left-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-xs font-semibold text-gold">
              <Star size={12} fill="currentColor" /> {rating.toFixed(1)}
            </span>
          )}
        </motion.div>

        <div className="mt-3 px-1">
          <h3 className="truncate text-sm md:text-base font-semibold text-white/90 group-hover:text-white">{title}</h3>
          <p className="text-xs text-white/40">{yearOf(movie) || "—"}</p>
        </div>
      </Link>

      {onRemove ? (
        <button
          aria-label={`Remove ${title}`}
          onClick={() => onRemove(movie.id)}
          className="absolute top-2.5 right-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:bg-nope hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      ) : (
        <button
          aria-label={liked ? `Remove ${title} from My List` : `Save ${title} to My List`}
          onClick={() => toggle(movie)}
          className="absolute top-2.5 right-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 backdrop-blur-md transition-transform hover:scale-110 active:scale-90"
        >
          <Heart size={16} className={liked ? "text-accent" : "text-white/80"} fill={liked ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}
