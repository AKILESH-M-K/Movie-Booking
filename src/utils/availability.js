import { seats } from "../data/bookingData";

// NOTE: This module simulates inventory for the demo. In production, theatre,
// show and seat availability must come from the server and seat holds/bookings
// must be enforced server-side, because client-side state can be edited.

const BOOKED_SEATS_KEY = "cinebookBookedSeats";

function readBookedSeats() {
  try {
    const value = localStorage.getItem(BOOKED_SEATS_KEY);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeBookedSeats(data) {
  try {
    localStorage.setItem(BOOKED_SEATS_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode / quota); availability falls back to generated data.
  }
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Deterministic pseudo-random value in [0, 1) for a given key.
function randomFromKey(key) {
  return hashString(key) / 4294967296;
}

export function getSelectionKey(movie, theatre, show) {
  if (!movie?.id || !theatre?.id || !show?.id) return null;
  return `${movie.id}:${theatre.id}:${show.id}`;
}

export function isTheatreAvailable(movie, theatre) {
  if (!movie?.id || !theatre?.id) return false;
  return randomFromKey(`theatre:${movie.id}:${theatre.id}`) > 0.12;
}

export function isShowAvailable(movie, theatre, show) {
  if (!movie?.id || !theatre?.id || !show?.id) return false;
  return randomFromKey(`show:${movie.id}:${theatre.id}:${show.id}`) > 0.18;
}

export function getBookedSeats(movie, theatre, show) {
  const key = getSelectionKey(movie, theatre, show);
  if (!key) return [];

  const saved = readBookedSeats();
  const persisted = Array.isArray(saved[key]) ? saved[key] : [];

  const generated = seats
    .filter((seat) => randomFromKey(`seat:${key}:${seat.id}`) < 0.12)
    .map((seat) => seat.id);

  return [...new Set([...generated, ...persisted])];
}

export function reserveSeats(movie, theatre, show, requestedSeats) {
  const key = getSelectionKey(movie, theatre, show);
  if (!key) return { success: false, conflicts: requestedSeats };

  const validSeatIds = new Set(seats.map((seat) => seat.id));
  const invalid = requestedSeats.filter((seat) => !validSeatIds.has(seat));
  if (invalid.length) return { success: false, conflicts: invalid };

  const booked = getBookedSeats(movie, theatre, show);
  const conflicts = requestedSeats.filter((seat) => booked.includes(seat));

  if (conflicts.length) {
    return { success: false, conflicts };
  }

  const allBooked = [...new Set([...booked, ...requestedSeats])];
  const saved = readBookedSeats();
  saved[key] = allBooked;
  writeBookedSeats(saved);

  return { success: true, conflicts: [] };
}
