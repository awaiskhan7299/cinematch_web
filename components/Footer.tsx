export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-5 py-8 pb-28 md:pb-8 text-center text-xs leading-relaxed text-white/35">
      <p className="font-display text-base font-bold text-white/60">
        Cine<span className="text-brand">Match</span>
      </p>
      <p className="mx-auto mt-2 max-w-xl">
        This product uses the TMDB API but is not endorsed or certified by{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">TMDB</a>.
        Movie data and images are provided by TMDB. Streaming availability by JustWatch via TMDB.
      </p>
    </footer>
  );
}
