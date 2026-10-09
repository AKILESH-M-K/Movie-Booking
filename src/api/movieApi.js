import movies from "../data/movies";
import { theatres as localTheatres, shows as localShows } from "../data/bookingData";
import { apiClient, API_ENABLED } from "./apiClient";

/**
 * Movie CRUD API Functions
 * Provides GET, POST, UPDATE, DELETE operations with console output logging
 * and resilient local fallback when the backend server is offline.
 */

// ----------------------------------------------------
// 1. GET (Read all movies & Read by ID)
// ----------------------------------------------------
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
  console.log("📥 [CRUD GET /movies] Fetching movies list...");
  if (!API_ENABLED) {
    console.log("✅ [CRUD GET /movies] Returned local movies:", movies);
    return movies;
  }

  try {
    const { data } = await apiClient.get("/movies");
    const catalog = mergeMovieCatalog(data);
    console.log(`✅ [CRUD GET /movies] Retrieved ${catalog.length} movies.`);
    return catalog;
  } catch (error) {
    console.warn("⚠️ [CRUD GET /movies] Backend server (http://localhost:4000) is unreachable. Falling back to local data:", error.message);
    console.log("✅ [CRUD GET /movies] Returned fallback local movies:", movies);
    return movies;
  }
}

export async function fetchMovieById(id) {
  console.log(`📥 [CRUD GET /movies/${id}] Fetching movie by ID...`);
  if (!API_ENABLED) {
    const movie = movies.find((m) => String(m.id) === String(id));
    console.log(`✅ [CRUD GET /movies/${id}] Returned local movie:`, movie);
    return movie;
  }

  try {
    const { data } = await apiClient.get(`/movies/${encodeURIComponent(id)}`);
    console.log(`✅ [CRUD GET /movies/${id}] Retrieved movie details from API:`, data);
    return data;
  } catch (error) {
    console.warn(`⚠️ [CRUD GET /movies/${id}] API unreachable. Falling back to local movie:`, error.message);
    const movie = movies.find((m) => String(m.id) === String(id));
    console.log(`✅ [CRUD GET /movies/${id}] Returned fallback local movie:`, movie);
    return movie;
  }
}

// ----------------------------------------------------
// 2. POST (Create new movie)
// ----------------------------------------------------
export async function createMovie(movie) {
  console.log("📤 [CRUD POST /movies] Creating new movie:", movie);
  if (!API_ENABLED) {
    const created = { id: Date.now(), ...movie };
    console.log("✅ [CRUD POST /movies] Local movie created:", created);
    return created;
  }

  try {
    const { data } = await apiClient.post("/movies", movie);
    console.log("✅ [CRUD POST /movies] Movie successfully created:", data);
    return data;
  } catch (error) {
    console.warn("⚠️ [CRUD POST /movies] API unreachable. Simulated local creation:", error.message);
    const created = { id: Date.now(), ...movie };
    console.log("✅ [CRUD POST /movies] Local fallback movie created:", created);
    return created;
  }
}

// ----------------------------------------------------
// 3. UPDATE / PUT / PATCH (Update movie)
// ----------------------------------------------------
export async function updateMovie(id, updateData, method = "PUT") {
  console.log(`🔄 [CRUD UPDATE ${method} /movies/${id}] Updating movie:`, updateData);
  if (!API_ENABLED) {
    const updated = { id, ...updateData };
    console.log(`✅ [CRUD UPDATE ${method} /movies/${id}] Local movie updated:`, updated);
    return updated;
  }

  try {
    const { data } = await apiClient.request({
      url: `/movies/${encodeURIComponent(id)}`,
      method,
      data: updateData,
    });
    console.log(`✅ [CRUD UPDATE ${method} /movies/${id}] Movie updated:`, data);
    return data;
  } catch (error) {
    console.warn(`⚠️ [CRUD UPDATE ${method} /movies/${id}] API unreachable. Simulated local update:`, error.message);
    const updated = { id, ...updateData };
    console.log(`✅ [CRUD UPDATE ${method} /movies/${id}] Local fallback updated:`, updated);
    return updated;
  }
}

// ----------------------------------------------------
// 4. DELETE (Delete movie)
// ----------------------------------------------------
export async function deleteMovie(id) {
  console.log(`🗑️ [CRUD DELETE /movies/${id}] Deleting movie...`);
  if (!API_ENABLED) {
    const res = { message: "Movie deleted.", id };
    console.log(`✅ [CRUD DELETE /movies/${id}] Local movie deleted:`, res);
    return res;
  }

  try {
    const { data } = await apiClient.delete(`/movies/${encodeURIComponent(id)}`);
    console.log(`✅ [CRUD DELETE /movies/${id}] Movie successfully deleted:`, data);
    return data;
  } catch (error) {
    console.warn(`⚠️ [CRUD DELETE /movies/${id}] API unreachable. Simulated local delete:`, error.message);
    const res = { message: "Movie deleted.", id };
    console.log(`✅ [CRUD DELETE /movies/${id}] Local fallback deleted:`, res);
    return res;
  }
}

// Ancillary GET functions
export async function fetchTheatres() {
  console.log("📥 [CRUD GET /theatres] Fetching theatres...");
  if (!API_ENABLED) return localTheatres;
  try {
    const { data } = await apiClient.get("/theatres");
    const result = data.length ? data : localTheatres;
    console.log("✅ [CRUD GET /theatres] Retrieved theatres:", result);
    return result;
  } catch (error) {
    console.warn("⚠️ [CRUD GET /theatres] API unreachable. Falling back to local theatres:", error.message);
    return localTheatres;
  }
}

export async function fetchShows() {
  console.log("📥 [CRUD GET /shows] Fetching show timings...");
  if (!API_ENABLED) return localShows;
  try {
    const { data } = await apiClient.get("/shows");
    const result = data.length ? data : localShows;
    console.log("✅ [CRUD GET /shows] Retrieved shows:", result);
    return result;
  } catch (error) {
    console.warn("⚠️ [CRUD GET /shows] API unreachable. Falling back to local shows:", error.message);
    return localShows;
  }
}

// Standard CRUD Aliases
export const getMovies = fetchMovies;
export const getMovieById = fetchMovieById;
export const postMovie = createMovie;
