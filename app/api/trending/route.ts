import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    // Fetching trending movies of the day
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`, {
      next: { revalidate: 3600 }, // Cache the data for 1 hour for extreme speed
    });

    if (!response.ok) throw new Error('Failed to fetch data');

    const data = await response.json();
    return NextResponse.json(data.results);
  } catch {
    return NextResponse.json({ error: 'Error fetching trending movies' }, { status: 500 });
  }
}