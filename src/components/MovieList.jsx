import MovieCard from "./MovieCard";

function MovieList({ movies, onSelectMovie, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-canvas-muted bg-surface px-6 py-16 text-center shadow-cozy">
        <div className="text-4xl">⏳</div>
        <h3 className="mt-4 font-serif text-2xl font-bold text-ink-primary">Loading movies…</h3>
        <p className="mt-2 font-sans text-base leading-7 text-ink-secondary">
          Fetching the latest movies from the server.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-brand/30 bg-surface px-6 py-16 text-center shadow-cozy">
        <div className="text-4xl">⚠️</div>
        <h3 className="mt-4 font-serif text-2xl font-bold text-ink-primary">Something went wrong</h3>
        <p className="mt-2 font-sans text-base leading-7 text-ink-secondary">{error}</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="rounded-2xl border border-dashed border-canvas-muted bg-surface px-6 py-16 text-center shadow-cozy">
        <div className="text-4xl">🎞️</div>
        <h3 className="mt-4 font-serif text-2xl font-bold text-ink-primary">No movies available</h3>
        <p className="mt-2 font-sans text-base leading-7 text-ink-secondary">
          Try another search term or choose a different genre.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-9 md:grid-cols-2">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
      ))}
    </div>
  );
}

export default MovieList;
