import { NextResponse } from "next/server";

const REGIONS = ["PK", "US", "IN", "GB", "AE", "SA"];

type Video = { key: string; site: string; type: string; official?: boolean };
type Crew = { job: string; name: string };
type ProviderRegion = { link?: string; flatrate?: unknown[]; rent?: unknown[]; buy?: unknown[] };
type TmdbMovie = {
  videos?: { results?: Video[] };
  credits?: { cast?: unknown[]; crew?: Crew[] };
  similar?: { results?: { poster_path: string | null }[] };
  "watch/providers"?: { results?: Record<string, ProviderRegion> };
  [key: string]: unknown;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is missing" }, { status: 500 });
  }
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid movie id" }, { status: 400 });
  }

  try {
    // One request instead of four: details + trailer + cast + providers + similar
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US&append_to_response=videos,credits,watch/providers,similar`,
      { next: { revalidate: 3600 } }
    );
    if (res.status === 404) return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    if (!res.ok) return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });

    const d = (await res.json()) as TmdbMovie;
    const { videos, credits, similar, "watch/providers": providers, ...details } = d;

    const vids = videos?.results ?? [];
    const trailer =
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      vids.find((v) => v.site === "YouTube" && v.type === "Teaser");

    const provResults = providers?.results ?? {};
    const region = REGIONS.find((r) => provResults[r]) || Object.keys(provResults)[0];
    const p = region ? provResults[region] : undefined;
    const streamingProviders = p?.flatrate || p?.rent || p?.buy || [];

    const director = (credits?.crew ?? []).find((c) => c.job === "Director")?.name ?? null;

    return NextResponse.json({
      ...details,
      trailerKey: trailer?.key ?? null,
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      streamingProviders,
      providerRegion: region ?? null,
      providerLink: p?.link ?? null,
      director,
      cast: (credits?.cast ?? []).slice(0, 12),
      similar: (similar?.results ?? []).filter((m) => m.poster_path).slice(0, 14),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 });
  }
}
