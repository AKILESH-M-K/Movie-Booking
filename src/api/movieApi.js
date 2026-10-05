import axios from "axios";

const BASE_URL = "http://localhost:4000";
const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });

// Experiment 1: Fetch API demonstration.
export async function fetchMovies() {
  const response = await fetch(`${BASE_URL}/movies`);
  if (!response.ok) throw new Error("Failed to fetch movies");
  return response.json();
}

// Experiment 1: Axios demonstration for dynamic REST API data.
export async function fetchMovieById(id) {
  const response = await api.get(`/movies/${id}`);
  return response.data;
}

export async function fetchTheatres() {
  const response = await api.get("/theatres");
  return response.data;
}
