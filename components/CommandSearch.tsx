"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Film, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MovieLite, img, titleOf, yearOf } from "../lib/movies";

export default function CommandSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery] = useDebounce(inputValue.trim(), 350);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const enabled = debouncedQuery.length > 1;
  const { data: results, isFetching, isError } = useQuery<MovieLite[]>({
    queryKey: ["search", debouncedQuery],
    enabled,
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const close = () => { setIsOpen(false); setInputValue(""); };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Search movies"
        className="flex items-center gap-3 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-colors group cursor-pointer"
      >
        <Search size={18} className="text-white/60 group-hover:text-white transition-colors" />
        <span className="text-sm font-medium text-white/50 group-hover:text-white transition-colors hidden sm:block">Search movies…</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs text-white/40">Ctrl K</kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-background/80 backdrop-blur-md"
          >
            <div className="absolute inset-0" onClick={close} />
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 26, stiffness: 350 }}
              className="relative w-full max-w-2xl mx-4 glass-panel overflow-hidden border-white/20 bg-background/90"
            >
              <div className="flex items-center px-5 py-4 border-b border-white/10">
                <Search className="text-white/40 mr-3 shrink-0" size={22} />
                <input
                  type="text" autoFocus placeholder="Search for a movie…"
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-transparent text-xl font-light text-white outline-none placeholder:text-white/25"
                />
                <button onClick={close} aria-label="Close search" className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                {!enabled && <div className="p-10 text-center text-white/30 font-light">Type at least 2 letters</div>}
                {enabled && isFetching && !results && <div className="p-8 text-center text-white/50">Searching…</div>}
                {isError && <div className="p-8 text-center text-nope">Search failed. Check your connection and try again.</div>}

                {results && results.length > 0 && (
                  <ul className="p-2">
                    {results.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/movie/${item.id}`}
                          onClick={close}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-16 shrink-0 rounded-md overflow-hidden bg-white/5 grid place-items-center">
                              {item.poster_path ? (
                                <img src={img(item.poster_path, "w200")} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Film size={18} className="text-white/30" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-base font-medium text-white/90">{titleOf(item)}</h4>
                              <p className="text-sm text-white/40">{yearOf(item) || "N/A"}</p>
                            </div>
                          </div>
                          {!!item.vote_average && item.vote_average > 0 && (
                            <div className="shrink-0 text-sm font-semibold text-gold">★ {item.vote_average.toFixed(1)}</div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {enabled && results && results.length === 0 && !isFetching && (
                  <div className="p-12 text-center text-white/40 font-light">
                    No movies found for &ldquo;<span className="text-white/70">{debouncedQuery}</span>&rdquo;
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
