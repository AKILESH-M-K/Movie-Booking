import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchMovies } from "../api/movieApi";
import useBooking from "./useBooking";

export default function useMovies() {
  const { selectMovie } = useBooking();
  const [moviesData, setMoviesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);
        setMoviesData(await fetchMovies());
      } catch (err) {
        setError(err.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  const genres = useMemo(() => ["All", ...new Set(moviesData.map((movie) => movie.genre))], [moviesData]);
  const filteredMovies = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return moviesData.filter((movie) => {
      const title = movie.title?.toLowerCase() || "";
      const genre = movie.genre?.toLowerCase() || "";
      const cast = Array.isArray(movie.cast) ? movie.cast.join(" ").toLowerCase() : movie.cast?.toLowerCase() || "";
      const language = movie.language?.toLowerCase() || "";
      return (!search || title.includes(search) || genre.includes(search) || cast.includes(search) || language.includes(search)) &&
        (selectedGenre === "All" || movie.genre === selectedGenre || genre.includes(selectedGenre.toLowerCase()));
    });
  }, [moviesData, searchTerm, selectedGenre]);

  const searchMovies = useCallback((value) => setSearchTerm(value), []);
  const filterByGenre = useCallback((genre) => setSelectedGenre(genre), []);
  const focusSearch = useCallback(() => searchInputRef.current?.focus(), []);
  const chooseMovie = useCallback((movie) => selectMovie(movie), [selectMovie]);

  return { movies: filteredMovies, loading, error, genres, searchTerm, selectedGenre, searchInputRef, searchMovies, filterByGenre, focusSearch, chooseMovie };
}
