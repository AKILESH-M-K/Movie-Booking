// Client-side booking history. This is a demo stand-in for a backend: in
// production, bookings are created and read through an authenticated API and
// the server decides the price and seat availability.

const LEGACY_KEY_PREFIX = "cinebookBooking:";
const HISTORY_KEY_PREFIX = "cinebookBookings:";

function historyKey(email) {
  return `${HISTORY_KEY_PREFIX}${email}`;
}

export function getBookings(email) {
  if (!email) return [];
  try {
    const value = localStorage.getItem(historyKey(email));
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBooking(email, booking) {
  const existing = getBookings(email);
  const next = [booking, ...existing.filter((item) => item.bookingId !== booking.bookingId)];
  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

// Older builds stored a single booking under a different key. Move it into the
// history list once so existing users do not lose their ticket.
export function migrateLegacyBooking(email) {
  if (!email) return;
  try {
    const legacyValue = localStorage.getItem(`${LEGACY_KEY_PREFIX}${email}`);
    if (!legacyValue) return;
    const legacy = JSON.parse(legacyValue);
    if (legacy?.bookingId) saveBooking(email, legacy);
    localStorage.removeItem(`${LEGACY_KEY_PREFIX}${email}`);
  } catch {
    // Malformed legacy data is ignored rather than breaking the bookings page.
  }
}
