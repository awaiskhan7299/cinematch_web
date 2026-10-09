import { NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";

const LIST_ENDPOINTS: Record<string, string> = {
  trending: "/trending/movie/day",
  top_rated: "/movie/top_rated",
  popular: "/movie/popular",
  now_playing: "/movie/now_playing",
  upcoming: "/movie/upcoming",
};

export async function GET(request: Request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is missing in .env.local" }, { status: 500 });
  }

  const sp = new URL(request.url).searchParams;
  const type = sp.get("type") || "";
  const genre = sp.get("genre");
  const lang = sp.get("lang");
  const page = Math.min(Math.max(parseInt(sp.get("page") || "1", 10) || 1, 1), 500);

  const params = new URLSearchParams({ api_key: apiKey, language: "en-US", page: String(page) });
  let path: string;

  if (LIST_ENDPOINTS[type] && !genre && !lang) {
    path = LIST_ENDPOINTS[type];
  } else {
    path = "/discover/movie";
    params.set("include_adult", "false");
    params.set("sort_by", type === "top_rated" ? "vote_average.desc" : "popularity.desc");
    params.set("vote_count.gte", type === "top_rated" ? "1000" : "100");
    // TMDB: "," = AND, "|" = OR. Rows like "Sci-Fi & Fantasy" want OR.
    if (genre) params.set("with_genres", genre.replace(/,/g, "|"));
    if (lang) params.set("with_original_language", lang);
  }

  try {
    const res = await fetch(`${BASE}${path}?${params}`, { next: { revalidate: 1800 } });
    if (!res.ok) {
      return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data.results ?? []);
  } catch {
    return NextResponse.json({ error: "Could not reach TMDB" }, { status: 502 });
  }
}
