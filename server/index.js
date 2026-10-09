import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    "Set JWT_SECRET to a random secret of at least 32 characters in server/.env",
  );
  process.exit(1);
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("PORT must be a valid port number.");
  process.exit(1);
}

const DB_PATH = path.join(__dirname, "..", "db.json");

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  if (req.path !== "/health") {
    console.log(`📡 [SERVER ${req.method}] ${req.originalUrl}`);
  }
  next();
});

// --------------------------------------------------
// DATABASE HELPERS
// --------------------------------------------------

function readDB() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

  db.users ||= [];
  db.movies ||= [];
  db.theatres ||= [];
  db.shows ||= [];
  db.bookings ||= [];

  return db;
}

function writeDB(db) {
  const temp = `${DB_PATH}.tmp`;

  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, DB_PATH);
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "30m",
    issuer: "cinebook-api",
    audience: "cinebook-client",
  });
}

function isValidEmail(email) {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function isValidSeat(seat) {
  return /^[A-F](?:[1-9]|10)$/.test(String(seat));
}

function getSelectedTheatre(db, theatre) {
  if (!db.theatres.length) return true;

  return db.theatres.find(
    (t) =>
      String(t.id) === String(theatre).trim() ||
      t.name === String(theatre).trim(),
  );
}

function getSelectedShow(db, show) {
  if (!db.shows.length) return true;

  return db.shows.find(
    (s) =>
      String(s.id) === String(show).trim() || s.time === String(show).trim(),
  );
}

function calculateAmount(price, seats) {
  return seats.reduce(
    (total, seat) => total + price + ("AB".includes(seat[0]) ? 50 : 0) + 25,
    0,
  );
}

function seatsConflict(db, movieId, theatre, show, seats, exceptId = null) {
  return db.bookings.some(
    (b) =>
      b.bookingId !== exceptId &&
      b.status !== "cancelled" &&
      String(b.movieId) === String(movieId) &&
      b.theatre === String(theatre).trim() &&
      b.show === String(show).trim() &&
      b.seats.some((seat) => seats.includes(String(seat))),
  );
}

// Customer information always comes from the authenticated account.
function getCustomer(user) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  };
}

// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token, ...extra] = header.split(" ");

  if (scheme !== "Bearer" || !token || extra.length > 0) {
    return res.status(401).json({
      message: "Authentication token required.",
      code: "TOKEN_REQUIRED",
    });
  }

  try {
    req.claims = jwt.verify(token, JWT_SECRET, {
      issuer: "cinebook-api",
      audience: "cinebook-client",
    });
  } catch (err) {
    return res.status(401).json({
      message: "Token is invalid or expired. Please sign in again.",
      code:
        err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
    });
  }

  try {
    const db = readDB();

    req.user = db.users.find((u) => u.id === req.claims.sub);

    if (!req.user) {
      return res.status(401).json({
        message: "Session is no longer valid. Sign in again.",
        code: "USER_NOT_FOUND",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cinebook-api",
  });
});

// --------------------------------------------------
// EXPERIMENT 4: SIGNUP
// --------------------------------------------------

app.post("/auth/signup", async (req, res, next) => {
  try {
    const { name, email, phone = "", password } = req.body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      typeof email !== "string" ||
      email.trim().length > 254 ||
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128 ||
      typeof phone !== "string" ||
      phone.length > 30
    ) {
      return res.status(400).json({
        message:
          "Enter a valid name, email, phone and password (8–128 characters).",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = readDB();

    if (db.users.some((u) => u.email === normalizedEmail)) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.replace(/\D/g, "").slice(0, 10),
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    writeDB(db);

    return res.status(201).json({
      message: "Account created successfully. Please log in.",
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 4: LOGIN
// --------------------------------------------------

app.post("/auth/login", async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    const db = readDB();
    const user = db.users.find((u) => u.email === email);

    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!valid) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    return res.json({
      token: signToken(user),
      tokenType: "Bearer",
      expiresIn: 1800,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 4: CURRENT USER
// --------------------------------------------------

app.get("/auth/me", auth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// --------------------------------------------------
// EXPERIMENT 4: UPDATE PROFILE
// --------------------------------------------------

app.patch("/auth/profile", auth, (req, res, next) => {
  try {
    const { name, phone } = req.body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      (phone !== undefined && (typeof phone !== "string" || phone.length > 30))
    ) {
      return res.status(400).json({
        message: "Enter valid profile details.",
      });
    }

    const db = readDB();
    const user = db.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.name = name.trim();

    if (typeof phone === "string") {
      user.phone = phone.replace(/\D/g, "").slice(0, 10);
    }

    writeDB(db);

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: MOVIES
// --------------------------------------------------

app.get("/movies", (_req, res, next) => {
  try {
    res.json(readDB().movies);
  } catch (err) {
    next(err);
  }
});

app.get("/movies/:id", (req, res, next) => {
  try {
    const db = readDB();
    const movie = db.movies.find((m) => String(m.id) === String(req.params.id));

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    res.json(movie);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: CREATE MOVIE (POST)
// --------------------------------------------------

app.post("/movies", (req, res, next) => {
  try {
    const { title, genre, rating, duration, price, language, cast, description, image } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Movie title is required." });
    }

    const db = readDB();
    const newMovie = {
      id: db.movies.length ? Math.max(...db.movies.map((m) => Number(m.id) || 0)) + 1 : 101,
      title: title.trim(),
      genre: genre || "Action",
      rating: Number(rating) || 4.5,
      duration: duration || "2h 30m",
      price: Number(price) || 200,
      language: language || "English",
      cast: cast || "",
      description: description || "",
      image: image || "",
    };

    db.movies.push(newMovie);
    writeDB(db);

    console.log(`[SERVER POST /movies] Created movie:`, newMovie.title);
    res.status(201).json(newMovie);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: UPDATE MOVIE (PUT)
// --------------------------------------------------

app.put("/movies/:id", (req, res, next) => {
  try {
    const db = readDB();
    const movieIndex = db.movies.findIndex((m) => String(m.id) === String(req.params.id));

    if (movieIndex === -1) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const existing = db.movies[movieIndex];
    const updatedMovie = {
      ...existing,
      ...req.body,
      id: existing.id,
    };

    db.movies[movieIndex] = updatedMovie;
    writeDB(db);

    console.log(`[SERVER PUT /movies/${req.params.id}] Updated movie:`, updatedMovie.title);
    res.json(updatedMovie);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: DELETE MOVIE (DELETE)
// --------------------------------------------------

app.delete("/movies/:id", (req, res, next) => {
  try {
    const db = readDB();
    const movieIndex = db.movies.findIndex((m) => String(m.id) === String(req.params.id));

    if (movieIndex === -1) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const deleted = db.movies.splice(movieIndex, 1)[0];
    writeDB(db);

    console.log(`[SERVER DELETE /movies/${req.params.id}] Deleted movie:`, deleted.title);
    res.json({ message: "Movie deleted successfully.", id: deleted.id });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: THEATRES
// --------------------------------------------------

app.get("/theatres", (req, res, next) => {
  try {
    const db = readDB();

    const theatres = db.theatres.length
      ? db.theatres
      : [
          {
            id: 1,
            name: "PVR INOX",
            location: "Prozone Mall",
            city: "Coimbatore",
          },
          {
            id: 2,
            name: "KG Cinemas",
            location: "Race Course",
            city: "Coimbatore",
          },
          {
            id: 3,
            name: "Fun Republic",
            location: "Peelamedu",
            city: "Coimbatore",
          },
          {
            id: 4,
            name: "Brookefields Cinemas",
            location: "Brookefields Mall",
            city: "Coimbatore",
          },
        ];

    res.json(theatres);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: SHOWS
// --------------------------------------------------

app.get("/shows", (req, res, next) => {
  try {
    const db = readDB();

    const shows = db.shows.length
      ? db.shows
      : [
          { id: 1, time: "10:00 AM", format: "2D", language: "English" },
          { id: 2, time: "01:30 PM", format: "2D", language: "English" },
          { id: 3, time: "04:30 PM", format: "2D", language: "English" },
          { id: 4, time: "07:30 PM", format: "IMAX", language: "English" },
          { id: 5, time: "10:30 PM", format: "2D", language: "English" },
        ];

    res.json(shows);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: GET BOOKING HISTORY
// --------------------------------------------------

app.get("/bookings", auth, (req, res, next) => {
  try {
    const db = readDB();

    const bookings = db.bookings
      .filter((b) => b.userId === req.user.id)
      .sort((a, b) => (b.bookedAt || "").localeCompare(a.bookedAt || ""));

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: GET ONE BOOKING
// --------------------------------------------------

app.get("/bookings/:id", auth, (req, res, next) => {
  try {
    const db = readDB();

    const booking = db.bookings.find((b) => b.bookingId === req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot view another user's booking.",
      });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: CREATE BOOKING
// Customer information is taken from the logged-in user.
// --------------------------------------------------

app.post("/bookings", auth, (req, res, next) => {
  try {
    const { movieId, theatre, show, seats, paymentMethod } = req.body || {};

    if (
      movieId === undefined ||
      typeof theatre !== "string" ||
      !theatre.trim() ||
      typeof show !== "string" ||
      !show.trim() ||
      !Array.isArray(seats) ||
      seats.length < 1 ||
      seats.length > 8 ||
      !seats.every(isValidSeat) ||
      typeof paymentMethod !== "string" ||
      !paymentMethod.trim() ||
      paymentMethod.trim().length > 40
    ) {
      return res.status(400).json({
        message: "Booking details are incomplete or invalid.",
      });
    }

    const uniqueSeats = seats.map(String);

    if (new Set(uniqueSeats).size !== uniqueSeats.length) {
      return res.status(400).json({
        message: "Duplicate seats are not allowed.",
      });
    }

    const db = readDB();

    const movie = db.movies.find((m) => String(m.id) === String(movieId));

    if (!movie) {
      return res.status(400).json({
        message: "Selected movie is invalid.",
      });
    }

    const selectedTheatre = getSelectedTheatre(db, theatre);
    const selectedShow = getSelectedShow(db, show);

    if (!selectedTheatre || !selectedShow) {
      return res.status(400).json({
        message: "Selected theatre or show is invalid.",
      });
    }

    if (seatsConflict(db, movie.id, theatre, show, uniqueSeats)) {
      return res.status(409).json({
        message: "One or more seats have already been booked.",
      });
    }

    const price = Number(movie.price || 0);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(500).json({
        message: "Movie pricing is incorrectly configured.",
      });
    }

    const amount = calculateAmount(price, uniqueSeats);

    const ticket = {
      bookingId: `CB${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
      userId: req.user.id,
      movieId: movie.id,
      movie: movie.title,
      theatre: theatre.trim().slice(0, 160),
      show: show.trim().slice(0, 80),
      seats: uniqueSeats,
      customer: getCustomer(req.user),
      amount,
      paymentMethod: paymentMethod.trim(),
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    };

    db.bookings.push(ticket);
    writeDB(db);

    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: UPDATE BOOKING (PUT)
// --------------------------------------------------

app.put("/bookings/:id", auth, (req, res, next) => {
  try {
    const db = readDB();

    const booking = db.bookings.find((b) => b.bookingId === req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot update another user's booking.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled bookings cannot be modified.",
      });
    }

    const { theatre, show, seats, paymentMethod } = req.body || {};

    if (
      typeof theatre !== "string" ||
      !theatre.trim() ||
      typeof show !== "string" ||
      !show.trim() ||
      !Array.isArray(seats) ||
      seats.length < 1 ||
      seats.length > 8 ||
      !seats.every(isValidSeat) ||
      new Set(seats.map(String)).size !== seats.length ||
      typeof paymentMethod !== "string" ||
      !paymentMethod.trim() ||
      paymentMethod.trim().length > 40
    ) {
      return res.status(400).json({
        message: "Invalid booking details.",
      });
    }

    const uniqueSeats = seats.map(String);

    const selectedTheatre = getSelectedTheatre(db, theatre);
    const selectedShow = getSelectedShow(db, show);

    if (!selectedTheatre || !selectedShow) {
      return res.status(400).json({
        message: "Selected theatre or show is invalid.",
      });
    }

    if (
      seatsConflict(
        db,
        booking.movieId,
        theatre,
        show,
        uniqueSeats,
        booking.bookingId,
      )
    ) {
      return res.status(409).json({
        message: "One or more selected seats are unavailable.",
      });
    }

    const movie = db.movies.find(
      (m) => String(m.id) === String(booking.movieId),
    );

    if (!movie) {
      return res.status(400).json({
        message: "Movie not found.",
      });
    }

    const price = Number(movie.price || 0);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(500).json({
        message: "Movie pricing is incorrectly configured.",
      });
    }

    booking.theatre = theatre.trim().slice(0, 160);
    booking.show = show.trim().slice(0, 80);
    booking.seats = uniqueSeats;

    // Keep the booking linked to the authenticated user's profile.
    booking.customer = getCustomer(req.user);
    booking.paymentMethod = paymentMethod.trim();
    booking.amount = calculateAmount(price, uniqueSeats);
    booking.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: PARTIAL UPDATE / CANCEL (PATCH)
// --------------------------------------------------

app.patch("/bookings/:id", auth, (req, res, next) => {
  try {
    const { status, customer } = req.body || {};

    if (status !== "cancelled" && (!customer || typeof customer !== "object")) {
      return res.status(400).json({
        message: "PATCH supports customer updates or status cancellation.",
      });
    }

    const db = readDB();

    const booking = db.bookings.find((b) => b.bookingId === req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot modify another user's booking.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled bookings cannot be modified.",
      });
    }

    if (customer && typeof customer === "object") {
      booking.customer = {
        name: typeof customer.name === "string" && customer.name.trim() ? customer.name.trim() : (booking.customer?.name || req.user.name),
        email: typeof customer.email === "string" && customer.email.trim() ? customer.email.trim() : (booking.customer?.email || req.user.email),
        phone: typeof customer.phone === "string" ? customer.phone.replace(/\D/g, "").slice(0, 10) : (booking.customer?.phone || ""),
      };
    }

    if (status === "cancelled") {
      booking.status = "cancelled";
    }

    booking.updatedAt = new Date().toISOString();

    writeDB(db);

    console.log(`[SERVER PATCH /bookings/${req.params.id}] Updated booking:`, booking.bookingId);
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// EXPERIMENT 3: DELETE / CANCEL BOOKING
// Soft deletion preserves booking history.
// --------------------------------------------------

app.delete("/bookings/:id", auth, (req, res, next) => {
  try {
    const db = readDB();

    const booking = db.bookings.find((b) => b.bookingId === req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot cancel another user's booking.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled.",
      });
    }

    booking.status = "cancelled";
    booking.updatedAt = new Date().toISOString();

    writeDB(db);

    res.status(200).json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// PAYMENT SIMULATION (PROTECTED)
// --------------------------------------------------

app.post("/payments/authorize", auth, (req, res, next) => {
  try {
    const { bookingId } = req.body || {};

    if (typeof bookingId !== "string" || !bookingId) {
      return res.status(400).json({
        message: "A valid booking ID is required.",
      });
    }

    const db = readDB();

    const booking = db.bookings.find(
      (b) => b.bookingId === bookingId && b.userId === req.user.id,
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status === "paid") {
      return res.json({
        status: "paid",
        bookingId: booking.bookingId,
        amount: booking.amount,
        reference: booking.paymentReference,
        paidAt: booking.paidAt,
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be paid for.",
      });
    }

    // Classroom simulation only. No real payment is processed.
    const reference = `DEMO-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const paidAt = new Date().toISOString();
    booking.status = "paid";
    booking.paymentReference = reference;
    booking.paidAt = paidAt;
    writeDB(db);

    res.json({
      status: "paid",
      bookingId: booking.bookingId,
      amount: booking.amount,
      reference,
      paidAt,
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// CENTRALIZED ERROR HANDLER
// --------------------------------------------------

app.use((err, _req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      message: "Request origin is not allowed.",
    });
  }

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`CineBook API running on port ${PORT}`);
});
