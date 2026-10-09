export type MovieLite = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  overview?: string;
  genre_ids?: number[];
};

export const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export const GENRE_FILTERS = [
  { id: "", label: "All" },
  { id: "28", label: "Action" },
  { id: "35", label: "Comedy" },
  { id: "27", label: "Horror" },
  { id: "10749", label: "Romance" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
  { id: "16", label: "Animation" },
  { id: "18", label: "Drama" },
  { id: "80", label: "Crime" },
  { id: "14", label: "Fantasy" },
];

export const LANG_FILTERS = [
  { id: "", label: "Any" },
  { id: "en", label: "Hollywood" },
  { id: "hi", label: "Bollywood" },
  { id: "ko", label: "Korean" },
  { id: "ja", label: "Anime / Japan" },
  { id: "ur", label: "Urdu" },
];

export const img = (path?: string | null, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export const titleOf = (m: MovieLite) => m.title || m.name || "Untitled";
export const yearOf = (m: MovieLite) => (m.release_date || "").slice(0, 4);

export const toLite = (m: MovieLite): MovieLite => ({
  id: m.id,
  title: titleOf(m),
  poster_path: m.poster_path,
  backdrop_path: m.backdrop_path ?? null,
  vote_average: m.vote_average ?? 0,
  release_date: m.release_date ?? "",
  overview: m.overview ?? "",
  genre_ids: m.genre_ids ?? [],
});

export type Genre = { id: number; name: string };
export type CastMember = { id: number; credit_id?: string; name: string; character?: string; profile_path: string | null };
export type Provider = { provider_id: number; provider_name: string; logo_path: string };

export type MovieDetails = MovieLite & {
  genres?: Genre[];
  tagline?: string;
  runtime?: number;
  vote_count?: number;
  trailerKey?: string | null;
  trailerUrl?: string | null;
  streamingProviders?: Provider[];
  providerRegion?: string | null;
  providerLink?: string | null;
  director?: string | null;
  cast?: CastMember[];
  similar?: MovieLite[];
};
