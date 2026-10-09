"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { MovieLite, toLite } from "./movies";

const LIKED_KEY = "cinematch:liked";
const SEEN_KEY = "cinematch:seen";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIKED_KEY || e.key === SEEN_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function parse<T>(raw: string): T[] {
  try {
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked */
  }
  emit();
}

export const readSeenIds = (): Set<number> => new Set(parse<number>(read(SEEN_KEY)));

export function useLiked() {
  const raw = useSyncExternalStore(subscribe, () => read(LIKED_KEY), () => "");
  const liked = useMemo(() => parse<MovieLite>(raw), [raw]);
  const ids = useMemo(() => new Set(liked.map((m) => m.id)), [liked]);

  const add = useCallback((m: MovieLite) => {
    const cur = parse<MovieLite>(read(LIKED_KEY));
    if (cur.some((x) => x.id === m.id)) return;
    write(LIKED_KEY, [toLite(m), ...cur]);
  }, []);

  const remove = useCallback((id: number) => {
    write(LIKED_KEY, parse<MovieLite>(read(LIKED_KEY)).filter((x) => x.id !== id));
  }, []);

  const toggle = useCallback((m: MovieLite) => {
    const cur = parse<MovieLite>(read(LIKED_KEY));
    if (cur.some((x) => x.id === m.id)) write(LIKED_KEY, cur.filter((x) => x.id !== m.id));
    else write(LIKED_KEY, [toLite(m), ...cur]);
  }, []);

  const clear = useCallback(() => write(LIKED_KEY, []), []);
  const has = useCallback((id: number) => ids.has(id), [ids]);

  return { liked, add, remove, toggle, clear, has };
}

export function useSeen() {
  const raw = useSyncExternalStore(subscribe, () => read(SEEN_KEY), () => "");
  const seen = useMemo(() => parse<number>(raw), [raw]);

  const markSeen = useCallback((id: number) => {
    const cur = parse<number>(read(SEEN_KEY));
    if (cur.includes(id)) return;
    write(SEEN_KEY, [...cur, id].slice(-1500));
  }, []);

  const unmarkSeen = useCallback((id: number) => {
    write(SEEN_KEY, parse<number>(read(SEEN_KEY)).filter((x) => x !== id));
  }, []);

  const clearSeen = useCallback(() => write(SEEN_KEY, []), []);

  return { seen, markSeen, unmarkSeen, clearSeen };
}
