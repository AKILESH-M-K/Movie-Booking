// Client-side booking history. This is a local storage store supporting full
// CRUD operations (GET, POST, UPDATE, DELETE) without logging stored ticket data.

const LEGACY_KEY_PREFIX = "cinebookBooking:";
const HISTORY_KEY_PREFIX = "cinebookBookings:";

function historyKey(email) {
  return `${HISTORY_KEY_PREFIX}${email}`;
}

// ----------------------------------------------------
// 1. GET (Read all & Read by ID)
// ----------------------------------------------------
export function getBookings(email) {
  if (!email) return [];
  try {
    const value = localStorage.getItem(historyKey(email));
    const parsed = value ? JSON.parse(value) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    return list;
  } catch {
    return [];
  }
}

export function getBookingById(email, id) {
  const all = getBookings(email);
  const found = all.find((item) => item.bookingId === id) || null;
  return found;
}

export function findAnyBookingById(id) {
  if (!id) return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        const parsed = value ? JSON.parse(value) : [];
        if (Array.isArray(parsed)) {
          const found = parsed.find(
            (b) => String(b.bookingId).toLowerCase() === String(id).toLowerCase(),
          );
          if (found) return found;
        }
      }
    }
  } catch {
    // Ignore malformed local entries and leave the ticket unresolved.
  }
  return null;
}

// ----------------------------------------------------
// 2. POST (Create / Save)
// ----------------------------------------------------
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

export const createBooking = saveBooking;

// ----------------------------------------------------
// 3. UPDATE / PUT / PATCH (Update)
// ----------------------------------------------------
export function updateBooking(email, id, updatedFields) {
  const existing = getBookings(email);
  let updatedItem = null;
  const next = existing.map((item) => {
    if (item.bookingId === id) {
      updatedItem = { ...item, ...updatedFields, updatedAt: new Date().toISOString() };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    return null;
  }

  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    return updatedItem;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// 4. DELETE (Remove / Cancel)
// ----------------------------------------------------
export function deleteBooking(email, id, softDelete = true) {
  const existing = getBookings(email);
  let next;
  if (softDelete) {
    next = existing.map((item) =>
      item.bookingId === id
        ? { ...item, status: "cancelled", updatedAt: new Date().toISOString() }
        : item,
    );
  } else {
    next = existing.filter((item) => item.bookingId !== id);
  }

  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export const cancelBooking = deleteBooking;

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
