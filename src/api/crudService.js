import { apiClient, API_ENABLED } from "./apiClient";
import localMovies from "../data/movies";

/**
 * Universal CRUD Service with automatic console logging for all operations:
 * - GET (Read all or Read by ID)
 * - POST (Create)
 * - UPDATE / PUT / PATCH (Update)
 * - DELETE (Delete / Remove)
 */

const LOG_STYLES = {
  header:
    "background: #1e293b; color: #38bdf8; font-weight: bold; font-size: 12px; padding: 3px 8px; border-radius: 4px;",
  get: "background: #0284c7; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  post: "background: #16a34a; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  update:
    "background: #d97706; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  delete:
    "background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  success: "color: #16a34a; font-weight: bold;",
};

/**
 * Log helper that outputs to browser console with styling and to Node terminal cleanly.
 */
function logCrud(operation, endpoint, details, result) {
  const opUpper = operation.toUpperCase();
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    const style = LOG_STYLES[operation.toLowerCase()] || LOG_STYLES.header;
    console.group(
      `%c[CRUD ${opUpper}]%c ${endpoint}`,
      style,
      "color: inherit; font-weight: normal;",
    );
    if (details !== undefined)
      console.log("➡️ Request Data / Params:", details);
    if (result !== undefined) console.log("⬅️ Response / Result:", result);
    console.groupEnd();
  } else {
    console.log(`\n================== [CRUD ${opUpper}] ==================`);
    console.log(`Endpoint: ${endpoint}`);
    if (details !== undefined)
      console.log("Request Payload:", JSON.stringify(details, null, 2));
    if (result !== undefined)
      console.log("Response Data:", JSON.stringify(result, null, 2));
    console.log("====================================================");
  }
}

// ----------------------------------------------------
// 1. GET (Read all or Read single)
// ----------------------------------------------------
export async function crudGet(endpoint, params = null) {
  try {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await apiClient.get(url, { params });
    logCrud("get", url, params, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ [CRUD GET FAILED] ${endpoint}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
}

export async function crudGetById(endpoint, id) {
  try {
    const cleanEndpoint = endpoint.replace(/\/+$/, "");
    const url = `${cleanEndpoint}/${encodeURIComponent(id)}`;
    const response = await apiClient.get(url);
    logCrud("get", url, { id }, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ [CRUD GET BY ID FAILED] ${endpoint}/${id}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
}

// ----------------------------------------------------
// 2. POST (Create)
// ----------------------------------------------------
export async function crudPost(endpoint, data) {
  try {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await apiClient.post(url, data);
    logCrud("post", url, data, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ [CRUD POST FAILED] ${endpoint}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
}

// ----------------------------------------------------
// 3. UPDATE / PUT / PATCH (Update)
// ----------------------------------------------------
export async function crudUpdate(endpoint, id, data, method = "PUT") {
  try {
    const cleanEndpoint = endpoint.replace(/\/+$/, "");
    const url = `${cleanEndpoint}/${encodeURIComponent(id)}`;
    const response = await apiClient.request({
      url,
      method: method.toUpperCase(),
      data,
    });
    logCrud("update", `${method.toUpperCase()} ${url}`, data, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ [CRUD UPDATE FAILED] ${endpoint}/${id}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
}

// ----------------------------------------------------
// 4. DELETE (Remove / Cancel)
// ----------------------------------------------------
export async function crudDelete(endpoint, id) {
  try {
    const cleanEndpoint = endpoint.replace(/\/+$/, "");
    const url = `${cleanEndpoint}/${encodeURIComponent(id)}`;
    const response = await apiClient.delete(url);
    logCrud("delete", url, { id }, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ [CRUD DELETE FAILED] ${endpoint}/${id}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
}

// ----------------------------------------------------
// Entity-Specific CRUD Objects
// ----------------------------------------------------
export const moviesCrud = {
  get: () => crudGet("/movies"),
  getById: (id) => crudGetById("/movies", id),
  post: (movieData) => crudPost("/movies", movieData),
  update: (id, movieData) => crudUpdate("/movies", id, movieData, "PUT"),
  delete: (id) => crudDelete("/movies", id),
};

export const bookingsCrud = {
  get: () => crudGet("/bookings"),
  getById: (id) => crudGetById("/bookings", id),
  post: (bookingData) => crudPost("/bookings", bookingData),
  update: (id, updateData, method = "PATCH") =>
    crudUpdate("/bookings", id, updateData, method),
  delete: (id) => crudDelete("/bookings", id),
};

// ----------------------------------------------------
// Comprehensive CRUD Demonstration Runner
// ----------------------------------------------------
export async function runCrudDemo() {
  console.log(
    "%c=======================================================",
    "color: #38bdf8; font-weight: bold;",
  );
  console.log(
    "%c🚀 [CINEBOOK CRUD DEMONSTRATION: GET, POST, UPDATE, DELETE]",
    "color: #22c55e; font-size: 14px; font-weight: bold;",
  );
  console.log(
    "%c=======================================================",
    "color: #38bdf8; font-weight: bold;",
  );

  const results = {
    get: null,
    post: null,
    update: null,
    delete: null,
  };

  try {
    // --------------------------------------------------
    // STEP 1: GET (Read)
    // --------------------------------------------------
    console.log("\n▶️ STEP 1: Executing GET (Fetch Movies list)...");
    let isServerUp = false;
    if (API_ENABLED) {
      try {
        results.get = await crudGet("/movies");
        isServerUp = true;
      } catch {
        console.warn(
          "ℹ️ [CRUD Notice] Backend server (port 4000) is currently offline. Simulating CRUD demo with local fallback.",
        );
        results.get = localMovies;
        logCrud("get", "/movies (local fallback)", null, results.get);
      }
    } else {
      results.get = localMovies;
      logCrud("get", "/movies (local)", null, results.get);
    }
    console.log(
      "📊 [GET Result Summary] Total movies fetched:",
      results.get?.length || 0,
    );

    // --------------------------------------------------
    // STEP 2: POST (Create)
    // --------------------------------------------------
    console.log("\n▶️ STEP 2: Executing POST (Create a new Movie)...");
    const testMoviePayload = {
      title: "Interstellar 2: Beyond the Horizon",
      genre: "Sci-Fi",
      rating: 4.9,
      duration: "2h 45m",
      price: 320,
      language: "English",
      cast: "Matthew McConaughey, Jessica Chastain",
      description: "Humanity explores a new dimension across space and time.",
      image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    };

    if (isServerUp) {
      try {
        results.post = await crudPost("/movies", testMoviePayload);
      } catch {
        results.post = {
          id: 999,
          ...testMoviePayload,
          createdAt: new Date().toISOString(),
        };
        logCrud("post", "/movies (simulated)", testMoviePayload, results.post);
      }
    } else {
      results.post = {
        id: 999,
        ...testMoviePayload,
        createdAt: new Date().toISOString(),
      };
      logCrud("post", "/movies (local mock)", testMoviePayload, results.post);
    }
    console.log(
      "✨ [POST Result Summary] Created Movie ID:",
      results.post?.id,
      results.post?.title,
    );

    // --------------------------------------------------
    // STEP 3: UPDATE / PUT (Update)
    // --------------------------------------------------
    const targetId = results.post?.id || 999;
    console.log(
      `\n▶️ STEP 3: Executing UPDATE / PUT (Update Movie ID: ${targetId})...`,
    );
    const updatePayload = {
      ...testMoviePayload,
      rating: 5.0,
      price: 350,
      description:
        "Humanity explores a new dimension across space and time. [UPDATED SPECIAL EDITION]",
    };

    if (isServerUp) {
      try {
        results.update = await crudUpdate(
          "/movies",
          targetId,
          updatePayload,
          "PUT",
        );
      } catch {
        results.update = {
          ...results.post,
          ...updatePayload,
          updatedAt: new Date().toISOString(),
        };
        logCrud(
          "update",
          `/movies/${targetId} (simulated)`,
          updatePayload,
          results.update,
        );
      }
    } else {
      results.update = {
        ...results.post,
        ...updatePayload,
        updatedAt: new Date().toISOString(),
      };
      logCrud(
        "update",
        `/movies/${targetId} (local mock)`,
        updatePayload,
        results.update,
      );
    }
    console.log(
      "🔄 [UPDATE Result Summary] Updated price to:",
      results.update?.price,
      "rating to:",
      results.update?.rating,
    );

    // --------------------------------------------------
    // STEP 4: DELETE (Remove)
    // --------------------------------------------------
    console.log(
      `\n▶️ STEP 4: Executing DELETE (Delete Movie ID: ${targetId})...`,
    );
    if (isServerUp) {
      try {
        results.delete = await crudDelete("/movies", targetId);
      } catch {
        results.delete = {
          message: "Movie deleted successfully.",
          id: targetId,
        };
        logCrud(
          "delete",
          `/movies/${targetId} (simulated)`,
          { id: targetId },
          results.delete,
        );
      }
    } else {
      results.delete = { message: "Movie deleted successfully.", id: targetId };
      logCrud(
        "delete",
        `/movies/${targetId} (local mock)`,
        { id: targetId },
        results.delete,
      );
    }
    console.log(
      "🗑️ [DELETE Result Summary] Movie deleted successfully:",
      results.delete,
    );

    console.log(
      "\n%c=======================================================",
      "color: #38bdf8; font-weight: bold;",
    );
    console.log(
      "%c✅ [CRUD OPERATIONS COMPLETED & CONSOLED SUCCESSFULLY!]",
      "color: #22c55e; font-size: 13px; font-weight: bold;",
    );
    console.log(
      "%c=======================================================\n",
      "color: #38bdf8; font-weight: bold;",
    );

    return results;
  } catch (err) {
    console.error("❌ [CRUD DEMO FAILED]:", err);
    return results;
  }
}

// Expose on window in browser environments for easy manual testing via browser console
if (typeof window !== "undefined") {
  window.runCrudDemo = runCrudDemo;
  window.crudService = {
    get: crudGet,
    getById: crudGetById,
    post: crudPost,
    update: crudUpdate,
    delete: crudDelete,
    movies: moviesCrud,
    bookings: bookingsCrud,
  };
}
