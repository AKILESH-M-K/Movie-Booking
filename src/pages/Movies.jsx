import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import { fetchMovies } from "../api/movieApi";

function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovies();
        setMovies(data);
      } catch (err) {
        setError(err.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  return (
    <main className="min-h-screen bg-canvas px-5 py-10 font-sans text-ink-primary">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Explore
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary">
            Movies
          </h1>

          <p className="mt-3 font-sans text-lg text-ink-secondary">
            Choose a movie and find your perfect show.
          </p>
        </div>

        <MovieList
          movies={movies}
          onSelectMovie={(movie) => navigate(`/movie/${movie.id}`)}
          loading={loading}
          error={error}
        />
      </div>
    </main>
  );
}

export default Movies;
