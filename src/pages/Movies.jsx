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
    <main className="min-h-screen bg-[#f9f4e4] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#a4652a]">
            Explore
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#3d3324]">Movies</h1>

          <p className="mt-3 text-lg text-[#776a54]">
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
