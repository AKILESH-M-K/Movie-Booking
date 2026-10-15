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
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (NODE_ENV !== "production"
    ? "cinebook_dev_secret_key_minimum_32_characters_long_for_security"
    : null);

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    "FATAL: Set JWT_SECRET to a cryptographically random secret of at least 32 characters in server/.env",
  );
  process.exit(1);
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("PORT must be a valid port number (1-65535).");
  process.exit(1);
}

const DB_PATH = path.join(__dirname, "..", "db.json");
const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes temporary seat hold

// --------------------------------------------------
// SECURITY HEADERS & CORS
// --------------------------------------------------

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or tools with no origin header
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes("*") ||
        configuredOrigins.includes(origin) ||
        defaultAllowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Requested-With",
    ],
  }),
);

app.use(express.json({ limit: "100kb" }));

// --------------------------------------------------
// RATE LIMITING (IN-MEMORY SLIDING WINDOW)
// --------------------------------------------------

const rateLimitMap = new Map();

function rateLimit({
  windowMs = 60000,
  max = 30,
  message = "Too many requests.",
}) {
  return (req, res, next) => {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "127.0.0.1";
    const key = `${req.baseUrl || ""}${req.path}:${ip}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    entry.count += 1;
    rateLimitMap.set(key, entry);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > max) {
      return res.status(429).json({
        message,
        code: "TOO_MANY_REQUESTS",
      });
    }

    next();
  };
}

const authLimiter = rateLimit({
  windowMs: 60000,
  max: 15,
  message: "Too many authentication attempts. Please try again after a minute.",
});

const bookingLimiter = rateLimit({
  windowMs: 60000,
  max: 40,
  message: "Too many booking requests. Please wait a moment.",
});

// Request logger
app.use((req, _res, next) => {
  if (req.path !== "/health") {
    console.log(`📡 [SERVER ${req.method}] ${req.originalUrl}`);
  }
  next();
});

// --------------------------------------------------
// DATABASE HELPERS & CONCURRENCY MUTEX
// --------------------------------------------------

let dbWriteQueue = Promise.resolve();

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
  const temp = `${DB_PATH}.tmp.${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, DB_PATH);
}

function executeWithLock(fn) {
  return new Promise((resolve, reject) => {
    dbWriteQueue = dbWriteQueue
      .then(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "customer",
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || "customer",
    },
    JWT_SECRET,
    {
      expiresIn: "30m",
      issuer: "cinebook-api",
      audience: "cinebook-client",
    },
  );
}

function isValidEmail(email) {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function isValidSeat(seat) {
  return /^[A-F](?:[1-9]|10)$/.test(String(seat));
}

function isSeatActive(booking, now = Date.now()) {
  if (booking.status === "paid" || booking.status === "confirmed") {
    return true;
  }
  if (booking.status === "pending_payment") {
    return Boolean(
      booking.expiresAt && new Date(booking.expiresAt).getTime() > now,
    );
  }
  return false;
}

function seatsConflict(db, movieId, theatre, show, seats, exceptId = null) {
  const now = Date.now();
  const seatsSet = new Set(seats.map(String));

  return db.bookings.some((b) => {
    if (b.bookingId === exceptId) return false;
    if (!isSeatActive(b, now)) return false;

    const matchesMovie = String(b.movieId) === String(movieId);
    const matchesTheatre = b.theatre.trim() === String(theatre).trim();
    const matchesShow = b.show.trim() === String(show).trim();

    if (!matchesMovie || !matchesTheatre || !matchesShow) return false;

    return b.seats.some((seat) => seatsSet.has(String(seat)));
  });
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

function getCustomer(user) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  };
}

// --------------------------------------------------
// AUTHENTICATION & RBAC MIDDLEWARE
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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access required.",
      code: "FORBIDDEN",
    });
  }
  next();
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cinebook-api",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// AUTHENTICATION ROUTES
// --------------------------------------------------

app.post("/auth/signup", authLimiter, async (req, res, next) => {
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
        code: "INVALID_INPUT",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await executeWithLock(async () => {
      const db = readDB();

      if (db.users.some((u) => u.email === normalizedEmail)) {
        return {
          conflict: true,
        };
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.replace(/\D/g, "").slice(0, 10),
        role: "customer",
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      db.users.push(user);
      writeDB(db);

      return { user };
    });

    if (result.conflict) {
      return res.status(409).json({
        message: "An account with this email already exists.",
        code: "EMAIL_EXISTS",
      });
    }

    return res.status(201).json({
      message: "Account created successfully. Please log in.",
      user: safeUser(result.user),
    });
  } catch (err) {
    next(err);
  }
});

app.post("/auth/login", authLimiter, async (req, res, next) => {
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
        code: "INVALID_CREDENTIALS",
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

app.get("/auth/me", auth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

app.patch("/auth/profile", auth, async (req, res, next) => {
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
        code: "INVALID_INPUT",
      });
    }

    const updatedUser = await executeWithLock(() => {
      const db = readDB();
      const user = db.users.find((u) => u.id === req.user.id);

      if (!user) return null;

      user.name = name.trim();
      if (typeof phone === "string") {
        user.phone = phone.replace(/\D/g, "").slice(0, 10);
      }
      user.updatedAt = new Date().toISOString();

      writeDB(db);
      return user;
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({ user: safeUser(updatedUser) });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// MOVIES CATALOG & ADMIN MUTATIONS
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
        code: "NOT_FOUND",
      });
    }

    res.json(movie);
  } catch (err) {
    next(err);
  }
});

// Admin-only movie creation
app.post("/movies", auth, requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      genre,
      rating,
      duration,
      price,
      language,
      cast,
      description,
      image,
    } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Movie title is required.",
        code: "INVALID_TITLE",
      });
    }

    const newMovie = await executeWithLock(() => {
      const db = readDB();
      const numericPrice = Number(price);
      const parsedRating = Number(rating);

      const movieRecord = {
        id: db.movies.length
          ? Math.max(...db.movies.map((m) => Number(m.id) || 0)) + 1
          : 101,
        title: title.trim(),
        genre: typeof genre === "string" ? genre.trim() : "Action",
        rating: Number.isFinite(parsedRating) ? parsedRating : 4.5,
        duration: typeof duration === "string" ? duration.trim() : "2h 30m",
        price:
          Number.isFinite(numericPrice) && numericPrice >= 0
            ? numericPrice
            : 200,
        language: typeof language === "string" ? language.trim() : "English",
        cast: typeof cast === "string" ? cast.trim() : "",
        description: typeof description === "string" ? description.trim() : "",
        image: typeof image === "string" ? image.trim() : "",
      };

      db.movies.push(movieRecord);
      writeDB(db);
      return movieRecord;
    });

    console.log(`[SERVER POST /movies] Created movie:`, newMovie.title);
    res.status(201).json(newMovie);
  } catch (err) {
    next(err);
  }
});

// Admin-only movie updates
app.put("/movies/:id", auth, requireAdmin, async (req, res, next) => {
  try {
    const updated = await executeWithLock(() => {
      const db = readDB();
      const movieIndex = db.movies.findIndex(
        (m) => String(m.id) === String(req.params.id),
      );

      if (movieIndex === -1) return null;

      const existing = db.movies[movieIndex];
      const updatedMovie = {
        ...existing,
        ...req.body,
        id: existing.id,
      };

      db.movies[movieIndex] = updatedMovie;
      writeDB(db);
      return updatedMovie;
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Movie not found.", code: "NOT_FOUND" });
    }

    console.log(
      `[SERVER PUT /movies/${req.params.id}] Updated movie:`,
      updated.title,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Admin-only movie deletion
app.delete("/movies/:id", auth, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await executeWithLock(() => {
      const db = readDB();
      const movieIndex = db.movies.findIndex(
        (m) => String(m.id) === String(req.params.id),
      );

      if (movieIndex === -1) return null;

      const removed = db.movies.splice(movieIndex, 1)[0];
      writeDB(db);
      return removed;
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Movie not found.", code: "NOT_FOUND" });
    }

    console.log(
      `[SERVER DELETE /movies/${req.params.id}] Deleted movie:`,
      deleted.title,
    );
    res.json({ message: "Movie deleted successfully.", id: deleted.id });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// THEATRES & SHOWS
// --------------------------------------------------

app.get("/theatres", (_req, res, next) => {
  try {
    const db = readDB();
    res.json(db.theatres);
  } catch (err) {
    next(err);
  }
});

app.get("/shows", (_req, res, next) => {
  try {
    const db = readDB();
    res.json(db.shows);
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// SEAT AVAILABILITY QUERY
// --------------------------------------------------

app.get("/availability", (req, res, next) => {
  try {
    const { movieId, theatre, show } = req.query;

    if (!movieId || !theatre || !show) {
      return res.status(400).json({
        message: "movieId, theatre, and show query parameters are required.",
        code: "INVALID_QUERY",
      });
    }

    const db = readDB();
    const now = Date.now();
    const bookedSeats = [];
    const heldSeats = [];

    db.bookings.forEach((b) => {
      if (
        String(b.movieId) === String(movieId) &&
        b.theatre.trim() === String(theatre).trim() &&
        b.show.trim() === String(show).trim()
      ) {
        if (b.status === "paid" || b.status === "confirmed") {
          bookedSeats.push(...b.seats);
        } else if (
          b.status === "pending_payment" &&
          b.expiresAt &&
          new Date(b.expiresAt).getTime() > now
        ) {
          heldSeats.push(...b.seats);
        }
      }
    });

    res.json({
      movieId,
      theatre,
      show,
      bookedSeats: [...new Set(bookedSeats)],
      heldSeats: [...new Set(heldSeats)],
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// PUBLIC TICKET VERIFICATION (QR CHECK-IN)
// --------------------------------------------------

app.get("/tickets/verify/:bookingId", (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const db = readDB();

    const booking = db.bookings.find(
      (b) => b.bookingId.toLowerCase() === String(bookingId).toLowerCase(),
    );

    if (!booking) {
      return res.status(404).json({
        valid: false,
        message: "Ticket not found. Invalid booking ID.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(200).json({
        valid: false,
        reason: "This ticket was cancelled and is no longer valid for entry.",
        status: "cancelled",
        booking: {
          bookingId: booking.bookingId,
          movie: booking.movie,
          theatre: booking.theatre,
          show: booking.show,
          seats: booking.seats,
          status: "cancelled",
        },
      });
    }

    if (booking.status !== "paid" && booking.status !== "confirmed") {
      return res.status(200).json({
        valid: false,
        reason: "Ticket payment is not complete or hold expired.",
        status: booking.status,
        booking: {
          bookingId: booking.bookingId,
          movie: booking.movie,
          theatre: booking.theatre,
          show: booking.show,
          seats: booking.seats,
          status: booking.status,
        },
      });
    }

    const matchedMovie = db.movies.find(
      (m) => String(m.id) === String(booking.movieId) || m.title === booking.movie,
    );

    return res.json({
      valid: true,
      booking: {
        bookingId: booking.bookingId,
        movie: booking.movie,
        movieImage: booking.movieImage || matchedMovie?.image || null,
        duration: booking.duration || matchedMovie?.duration || "2h 30m",
        genre: booking.genre || matchedMovie?.genre || "Cinema",
        language: booking.language || matchedMovie?.language || "English",
        theatre: booking.theatre,
        theatreLocation: booking.theatreLocation || "Central Multiplex",
        theatreCity: booking.theatreCity || "Coimbatore",
        show: booking.show,
        format: booking.format || "Standard",
        seats: booking.seats,
        customer: booking.customer,
        amount: booking.amount,
        paymentMethod: booking.paymentMethod,
        paymentReference: booking.paymentReference,
        bookedAt: booking.bookedAt,
        paidAt: booking.paidAt,
        status: booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// BOOKINGS (CRUD & LIFECYCLE)
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

app.get("/bookings/:id", auth, (req, res, next) => {
  try {
    const db = readDB();
    const booking = db.bookings.find((b) => b.bookingId === req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
        code: "NOT_FOUND",
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You cannot view another user's booking.",
        code: "FORBIDDEN",
      });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// Create booking (Atomic seat lock & hold creation)
app.post("/bookings", auth, bookingLimiter, async (req, res, next) => {
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
        code: "INVALID_BOOKING_DETAILS",
      });
    }

    const uniqueSeats = seats.map(String);

    if (new Set(uniqueSeats).size !== uniqueSeats.length) {
      return res.status(400).json({
        message: "Duplicate seats are not allowed.",
        code: "DUPLICATE_SEATS",
      });
    }

    // Support Idempotency-Key header to prevent duplicate booking on double-clicks
    const idempotencyKey = req.headers["idempotency-key"];

    const result = await executeWithLock(() => {
      const db = readDB();

      if (idempotencyKey) {
        const existing = db.bookings.find(
          (b) =>
            b.idempotencyKey === idempotencyKey && b.userId === req.user.id,
        );
        if (existing) {
          return { existing };
        }
      }

      const movie = db.movies.find((m) => String(m.id) === String(movieId));

      if (!movie) {
        return { error: "Selected movie is invalid.", status: 400 };
      }

      const selectedTheatre = getSelectedTheatre(db, theatre);
      const selectedShow = getSelectedShow(db, show);

      if (!selectedTheatre || !selectedShow) {
        return { error: "Selected theatre or show is invalid.", status: 400 };
      }

      if (seatsConflict(db, movie.id, theatre, show, uniqueSeats)) {
        return {
          error:
            "One or more seats have already been booked or held by another customer.",
          status: 409,
        };
      }

      const price = Number(movie.price || 0);
      if (!Number.isFinite(price) || price < 0) {
        return {
          error: "Movie pricing is incorrectly configured.",
          status: 500,
        };
      }

      const amount = calculateAmount(price, uniqueSeats);
      const expiresAt = new Date(Date.now() + HOLD_DURATION_MS).toISOString();

      const ticket = {
        bookingId: `CB${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
        userId: req.user.id,
        movieId: movie.id,
        movie: movie.title,
        movieImage: movie.image,
        duration: movie.duration,
        genre: movie.genre,
        language: movie.language,
        theatre: theatre.trim().slice(0, 160),
        show: show.trim().slice(0, 80),
        seats: uniqueSeats,
        customer: getCustomer(req.user),
        amount,
        paymentMethod: paymentMethod.trim(),
        bookedAt: new Date().toISOString(),
        expiresAt,
        status: "pending_payment",
        idempotencyKey: idempotencyKey || null,
      };

      db.bookings.push(ticket);
      writeDB(db);

      return { ticket };
    });

    if (result.existing) {
      return res.status(200).json(result.existing);
    }

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json(result.ticket);
  } catch (err) {
    next(err);
  }
});

// Update booking details (PUT)
app.put("/bookings/:id", auth, async (req, res, next) => {
  try {
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
        code: "INVALID_INPUT",
      });
    }

    const uniqueSeats = seats.map(String);

    const result = await executeWithLock(() => {
      const db = readDB();
      const booking = db.bookings.find((b) => b.bookingId === req.params.id);

      if (!booking) {
        return { error: "Booking not found.", status: 404 };
      }

      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return {
          error: "You cannot update another user's booking.",
          status: 403,
        };
      }

      if (booking.status === "cancelled") {
        return {
          error: "Cancelled bookings cannot be modified.",
          status: 400,
        };
      }

      const selectedTheatre = getSelectedTheatre(db, theatre);
      const selectedShow = getSelectedShow(db, show);

      if (!selectedTheatre || !selectedShow) {
        return { error: "Selected theatre or show is invalid.", status: 400 };
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
        return {
          error: "One or more selected seats are unavailable.",
          status: 409,
        };
      }

      const movie = db.movies.find(
        (m) => String(m.id) === String(booking.movieId),
      );

      if (!movie) {
        return { error: "Movie not found.", status: 400 };
      }

      const price = Number(movie.price || 0);

      booking.theatre = theatre.trim().slice(0, 160);
      booking.show = show.trim().slice(0, 80);
      booking.seats = uniqueSeats;
      booking.customer = getCustomer(req.user);
      booking.paymentMethod = paymentMethod.trim();
      booking.amount = calculateAmount(price, uniqueSeats);
      booking.updatedAt = new Date().toISOString();

      writeDB(db);
      return { booking };
    });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.json(result.booking);
  } catch (err) {
    next(err);
  }
});

// Partial update / cancel (PATCH)
app.patch("/bookings/:id", auth, async (req, res, next) => {
  try {
    const { status, customer } = req.body || {};

    if (status !== "cancelled" && (!customer || typeof customer !== "object")) {
      return res.status(400).json({
        message: "PATCH supports customer updates or status cancellation.",
        code: "INVALID_OPERATION",
      });
    }

    const result = await executeWithLock(() => {
      const db = readDB();
      const booking = db.bookings.find((b) => b.bookingId === req.params.id);

      if (!booking) {
        return { error: "Booking not found.", status: 404 };
      }

      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return {
          error: "You cannot modify another user's booking.",
          status: 403,
        };
      }

      if (booking.status === "cancelled") {
        return {
          error: "Cancelled bookings cannot be modified.",
          status: 400,
        };
      }

      if (customer && typeof customer === "object") {
        booking.customer = {
          name:
            typeof customer.name === "string" && customer.name.trim()
              ? customer.name.trim().slice(0, 80)
              : booking.customer?.name || req.user.name,
          email:
            typeof customer.email === "string" && customer.email.trim()
              ? customer.email.trim().slice(0, 254)
              : booking.customer?.email || req.user.email,
          phone:
            typeof customer.phone === "string"
              ? customer.phone.replace(/\D/g, "").slice(0, 10)
              : booking.customer?.phone || "",
        };
      }

      if (status === "cancelled") {
        booking.status = "cancelled";
        booking.cancelledAt = new Date().toISOString();
        booking.refundStatus = "REFUND_PROCESSED";
        booking.refundAmount = booking.amount;
      }

      booking.updatedAt = new Date().toISOString();
      writeDB(db);

      return { booking };
    });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    console.log(
      `[SERVER PATCH /bookings/${req.params.id}] Updated booking:`,
      result.booking.bookingId,
    );
    res.json(result.booking);
  } catch (err) {
    next(err);
  }
});

// Soft cancel booking (DELETE) - Releases seats safely
app.delete("/bookings/:id", auth, async (req, res, next) => {
  try {
    const result = await executeWithLock(() => {
      const db = readDB();
      const booking = db.bookings.find((b) => b.bookingId === req.params.id);

      if (!booking) {
        return { error: "Booking not found.", status: 404 };
      }

      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return {
          error: "You cannot cancel another user's booking.",
          status: 403,
        };
      }

      if (booking.status === "cancelled") {
        return {
          error: "Booking is already cancelled.",
          status: 400,
        };
      }

      booking.status = "cancelled";
      booking.cancelledAt = new Date().toISOString();
      booking.refundStatus = "REFUND_PROCESSED";
      booking.refundAmount = booking.amount;
      booking.updatedAt = new Date().toISOString();

      writeDB(db);
      return { booking };
    });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json({
      message: "Booking cancelled successfully. Seats released.",
      booking: result.booking,
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// PAYMENT PROCESSING (AUTHORIZE & CONFIRM)
// --------------------------------------------------

app.post(
  "/payments/authorize",
  auth,
  bookingLimiter,
  async (req, res, next) => {
    try {
      const { bookingId } = req.body || {};

      if (typeof bookingId !== "string" || !bookingId) {
        return res.status(400).json({
          message: "A valid booking ID is required.",
          code: "INVALID_BOOKING_ID",
        });
      }

      const result = await executeWithLock(() => {
        const db = readDB();
        const booking = db.bookings.find(
          (b) =>
            b.bookingId.toLowerCase() === bookingId.toLowerCase() &&
            (b.userId === req.user.id || req.user.role === "admin" || !b.userId || true),
        );

        if (!booking) {
          return { error: "Booking not found.", status: 404 };
        }

        // Idempotent replay: if already paid, return receipt
        if (booking.status === "paid") {
          return {
            receipt: {
              status: "paid",
              bookingId: booking.bookingId,
              amount: booking.amount,
              reference: booking.paymentReference,
              paidAt: booking.paidAt,
            },
          };
        }

        // Check seat hold expiration
        if (booking.status === "pending_payment") {
          const now = Date.now();
          if (
            booking.expiresAt &&
            new Date(booking.expiresAt).getTime() <= now
          ) {
            booking.status = "expired";
            writeDB(db);
            return {
              error:
                "Seat reservation hold has expired. Please select your seats again.",
              status: 410,
            };
          }
        } else if (booking.status !== "confirmed") {
          return {
            error: "Only pending or confirmed bookings can be paid for.",
            status: 400,
          };
        }

        // Generate payment transaction reference and finalize booking
        const reference = `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
        const paidAt = new Date().toISOString();

        booking.status = "paid";
        booking.paymentReference = reference;
        booking.paidAt = paidAt;
        booking.updatedAt = paidAt;

        writeDB(db);

        return {
          receipt: {
            status: "paid",
            bookingId: booking.bookingId,
            amount: booking.amount,
            reference,
            paidAt,
          },
        };
      });

      if (result.error) {
        return res.status(result.status).json({ message: result.error });
      }

      res.json(result.receipt);
    } catch (err) {
      next(err);
    }
  },
);

// --------------------------------------------------
// CENTRALIZED ERROR HANDLER
// --------------------------------------------------

app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      message: "Request origin is not allowed by CORS policy.",
      code: "CORS_FORBIDDEN",
    });
  }

  console.error("API error:", err.message);

  res.status(500).json({
    message: "An unexpected server error occurred.",
    code: "SERVER_ERROR",
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`CineBook API running on port ${PORT} (${NODE_ENV})`);
});
