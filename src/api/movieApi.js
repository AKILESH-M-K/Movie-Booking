import axios from "axios";
import movies from "../data/movies";
import { theatres } from "../data/bookingData";

// The local JSON server is useful for the classroom/demo environment.
// GitHub Pages cannot run a localhost API, so production uses the bundled data.
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";
const useRemoteApi = import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL);
const api = axios.create({ baseURL: API_URL, timeout: 5000 });

async function tryRemote(request, fallback) {
  if (!useRemoteApi) return fallback;
  try {
    return await request();
  } catch {
    return fallback;
  }
}

export async function fetchMovies() {
  return tryRemote(
    async () => {
      const response = await fetch(`${API_URL}/movies`);
      if (!response.ok) throw new Error("Failed to fetch movies");
      return response.json();
    },
    movies,
  );
}

export async function fetchMovieById(id) {
  const fallback = movies.find((movie) => String(movie.id) === String(id));
  return tryRemote(
    async () => {
      const response = await api.get(`/movies/${encodeURIComponent(id)}`);
      return response.data;
    },
    fallback,
  );
}

export async function fetchTheatres() {
  return tryRemote(
    async () => {
      const response = await api.get("/theatres");
      return response.data;
    },
    theatres,
  );
}
