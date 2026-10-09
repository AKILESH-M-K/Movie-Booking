import MovieCard from "./MovieCard";

function MovieList({ movies, onSelectMovie, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#ffffff] px-6 py-14 text-center shadow-sm">
        <div className="text-4xl">⏳</div>
        <h3 className="mt-4 text-xl font-black text-[#483e2d]">Loading movies…</h3>
        <p className="mt-2 text-base leading-7 text-[#667085]">
          Fetching the latest movies from the server.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#ffffff] px-6 py-14 text-center shadow-sm">
        <div className="text-4xl">⚠️</div>
        <h3 className="mt-4 text-xl font-black text-[#483e2d]">Something went wrong</h3>
        <p className="mt-2 text-base leading-7 text-[#667085]">{error}</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#ffffff] px-6 py-14 text-center shadow-sm">
        <div className="text-4xl">🎞️</div>
        <h3 className="mt-4 text-xl font-black text-[#483e2d]">No movies available</h3>
        <p className="mt-2 text-base leading-7 text-[#667085]">
          Try another search term or choose a different genre.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
      ))}
    </div>
  );
}

export default MovieList;
