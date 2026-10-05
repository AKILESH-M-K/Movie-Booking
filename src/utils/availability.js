import { seats } from "../data/bookingData";

const BOOKED_SEATS_KEY = "cinebookBookedSeats";

function readBookedSeats() {
  try {
    const value = localStorage.getItem(BOOKED_SEATS_KEY);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBookedSeats(data) {
  localStorage.setItem(BOOKED_SEATS_KEY, JSON.stringify(data));
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFromKey(key) {
  return hashString(key) / 4294967295;
}

export function getSelectionKey(movie, theatre, show) {
  return `${movie?.id ?? "movie"}:${theatre?.id ?? "theatre"}:${show?.id ?? "show"}`;
}

export function isTheatreAvailable(movie, theatre) {
  const value = randomFromKey(`theatre:${movie?.id}:${theatre.id}`);
  return value > 0.12;
}

export function isShowAvailable(movie, theatre, show) {
  const value = randomFromKey(`show:${movie?.id}:${theatre?.id}:${show.id}`);
  return value > 0.18;
}

export function getBookedSeats(movie, theatre, show) {
  const key = getSelectionKey(movie, theatre, show);
  const saved = readBookedSeats();
  const persisted = Array.isArray(saved[key]) ? saved[key] : [];

  const generated = seats
    .filter((seat) => randomFromKey(`seat:${key}:${seat.id}`) < 0.12)
    .map((seat) => seat.id);

  return [...new Set([...generated, ...persisted])];
}

export function reserveSeats(movie, theatre, show, requestedSeats) {
  const key = getSelectionKey(movie, theatre, show);
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
