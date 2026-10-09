import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  const apiKey = process.env.TMDB_API_KEY;

  if (!q) return NextResponse.json([]);
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is missing in .env.local" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=en-US&page=1&include_adult=false`
    );
    if (!res.ok) return NextResponse.json({ error: "Search failed" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json((data.results ?? []).slice(0, 12));
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
