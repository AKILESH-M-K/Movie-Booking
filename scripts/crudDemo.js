/**
 * CRUD Operations Demonstration Script
 * Tests and logs GET, POST, UPDATE, DELETE operations directly to the console.
 *
 * Usage:
 *   node scripts/crudDemo.js
 *   or: npm run crud
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "db.json");
const API_URL = "http://localhost:4000";

async function isServerRunning() {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function runLiveApiDemo() {
  console.log("\n🌐 Running CRUD demonstration against live API server at http://localhost:4000\n");

  // 1. GET (Read All)
  console.log("==================================================");
  console.log("📥 [1. GET] Retrieving movies list from GET /movies");
  console.log("==================================================");
  const getRes = await fetch(`${API_URL}/movies`);
  const movies = await getRes.json();
  console.log(`✅ [GET Response Status]: ${getRes.status} OK`);
  console.log(`📊 [GET Movies Count]: ${movies.length} movies retrieved.`);
  console.log(`🎬 [Sample Movie]:`, movies[0] ? { id: movies[0].id, title: movies[0].title, price: movies[0].price } : "No movies");

  // 2. POST (Create)
  console.log("\n==================================================");
  console.log("📤 [2. POST] Creating a new movie with POST /movies");
  console.log("==================================================");
  const newMovieData = {
    title: "Gladiator II: Arena of Honor",
    genre: "Action",
    rating: 4.8,
    duration: "2h 28m",
    price: 300,
    language: "English",
    cast: "Paul Mescal, Pedro Pascal, Denzel Washington",
    description: "Years after witnessing the death of Maximus, Lucius enters the Colosseum.",
    image: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
  };
  console.log("📦 [POST Request Payload]:", newMovieData);
  const postRes = await fetch(`${API_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newMovieData),
  });
  const createdMovie = await postRes.json();
  console.log(`✅ [POST Response Status]: ${postRes.status} Created`);
  console.log("✨ [POST Response Data]:", createdMovie);

  const movieId = createdMovie.id;

  // 3. UPDATE / PUT (Update)
  console.log("\n==================================================");
  console.log(`🔄 [3. UPDATE (PUT)] Updating movie with PUT /movies/${movieId}`);
  console.log("==================================================");
  const updateMovieData = {
    ...createdMovie,
    rating: 5.0,
    price: 350,
    title: "Gladiator II: Arena of Honor (IMAX Remastered)",
  };
  console.log("📦 [PUT Request Payload]:", updateMovieData);
  const putRes = await fetch(`${API_URL}/movies/${movieId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateMovieData),
  });
  const updatedMovie = await putRes.json();
  console.log(`✅ [PUT Response Status]: ${putRes.status} OK`);
  console.log("✨ [PUT Response Data]:", updatedMovie);

  // 4. DELETE (Remove)
  console.log("\n==================================================");
  console.log(`🗑️ [4. DELETE] Deleting movie with DELETE /movies/${movieId}`);
  console.log("==================================================");
  const deleteRes = await fetch(`${API_URL}/movies/${movieId}`, {
    method: "DELETE",
  });
  const deleteResult = await deleteRes.json();
  console.log(`✅ [DELETE Response Status]: ${deleteRes.status} OK`);
  console.log("✨ [DELETE Response Data]:", deleteResult);

  // Verification GET
  console.log("\n==================================================");
  console.log(`🔍 [VERIFY GET] Verifying deletion with GET /movies/${movieId}`);
  console.log("==================================================");
  const verifyRes = await fetch(`${API_URL}/movies/${movieId}`);
  console.log(`✅ [GET Response Status]: ${verifyRes.status} (Expected 404 Not Found)`);
}

function runLocalDbDemo() {
  console.log("\n💾 Live API server is not running; running CRUD demonstration against local db.json\n");

  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  db.movies ||= [];

  // 1. GET
  console.log("==================================================");
  console.log("📥 [1. GET] Reading movies list from local database");
  console.log("==================================================");
  console.log(`📊 Total Movies in database: ${db.movies.length}`);
  console.log("🎬 First 2 Movies:", db.movies.slice(0, 2));

  // 2. POST
  console.log("\n==================================================");
  console.log("📤 [2. POST] Creating a new record in local database");
  console.log("==================================================");
  const newId = db.movies.length ? Math.max(...db.movies.map((m) => Number(m.id) || 0)) + 1 : 101;
  const newRecord = {
    id: newId,
    title: "Gladiator II: Arena of Honor",
    genre: "Action",
    rating: 4.8,
    duration: "2h 28m",
    price: 300,
    language: "English",
  };
  console.log("📦 Record to create:", newRecord);
  db.movies.push(newRecord);
  console.log("✅ [POST Created Record]:", newRecord);

  // 3. UPDATE
  console.log("\n==================================================");
  console.log(`🔄 [3. UPDATE] Updating record ID: ${newId}`);
  console.log("==================================================");
  const idx = db.movies.findIndex((m) => m.id === newId);
  db.movies[idx] = { ...db.movies[idx], rating: 5.0, price: 350 };
  console.log("✅ [UPDATE Result]:", db.movies[idx]);

  // 4. DELETE
  console.log("\n==================================================");
  console.log(`🗑️ [4. DELETE] Deleting record ID: ${newId}`);
  console.log("==================================================");
  const deleted = db.movies.splice(idx, 1)[0];
  console.log("✅ [DELETE Result]: Deleted record:", deleted);

  console.log("\n==================================================");
  console.log("✅ All CRUD operations executed and consoled successfully!");
  console.log("==================================================");
}

async function main() {
  console.log("************************************************************");
  console.log("   CINEBOOK - CRUD FUNCTIONS DEMONSTRATION CONSOLE OUTPUT   ");
  console.log("   Operations: GET, POST, UPDATE, DELETE                    ");
  console.log("************************************************************");

  const running = await isServerRunning();
  if (running) {
    await runLiveApiDemo();
  } else {
    runLocalDbDemo();
  }

  console.log("\n🎉 CRUD Demonstration Complete!\n");
}

main().catch((err) => {
  console.error("Execution error:", err);
});

