import movies from "../data/movies";
import { theatres as localTheatres, shows as localShows } from "../data/bookingData";
import { apiClient, API_ENABLED } from "./apiClient";

function mergeMovieCatalog(apiMovies) {
  const catalog = new Map(movies.map((movie) => [String(movie.id), movie]));
  for (const movie of Array.isArray(apiMovies) ? apiMovies : []) {
    if (movie?.id == null) continue;
    const key = String(movie.id);
    catalog.set(key, { ...catalog.get(key), ...movie });
  }
  return [...catalog.values()];
}

export async function fetchMovies() {
  if (!API_ENABLED) return movies;
  try {
    const { data } = await apiClient.get("/movies");
    return mergeMovieCatalog(data);
  } catch {
    return movies;
  }
}

export async function fetchMovieById(id) {
  if (!API_ENABLED) return movies.find((movie) => String(movie.id) === String(id));
  try {
    const { data } = await apiClient.get(`/movies/${encodeURIComponent(id)}`);
    return data;
  } catch (error) {
    if (error.response) throw error;
    return movies.find((movie) => String(movie.id) === String(id));
  }
}

export async function createMovie(movie) {
  if (!API_ENABLED) throw new Error("Movie API is not configured. The movie was not created.");
  const { data } = await apiClient.post("/movies", movie);
  return data;
}

export async function updateMovie(id, updateData, method = "PUT") {
  if (!API_ENABLED) throw new Error("Movie API is not configured. The movie was not updated.");
  const { data } = await apiClient.request({
    url: `/movies/${encodeURIComponent(id)}`,
    method,
    data: updateData,
  });
  return data;
}

export async function deleteMovie(id) {
  if (!API_ENABLED) throw new Error("Movie API is not configured. The movie was not deleted.");
  const { data } = await apiClient.delete(`/movies/${encodeURIComponent(id)}`);
  return data;
}

export async function fetchTheatres() {
  if (!API_ENABLED) return localTheatres;
  try {
    const { data } = await apiClient.get("/theatres");
    return Array.isArray(data) ? data : localTheatres;
  } catch (error) {
    if (error.response) throw error;
    return localTheatres;
  }
}

export async function fetchShows() {
  if (!API_ENABLED) return localShows;
  try {
    const { data } = await apiClient.get("/shows");
    return Array.isArray(data) ? data : localShows;
  } catch (error) {
    if (error.response) throw error;
    return localShows;
  }
}

export const getMovies = fetchMovies;
export const getMovieById = fetchMovieById;
export const postMovie = createMovie;
