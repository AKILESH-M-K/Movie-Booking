// Client-side booking history. This is a local storage store supporting full
// CRUD operations (GET, POST, UPDATE, DELETE) with console logging.

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
    console.log(`📥 [LOCAL STORE GET /bookings] Bookings for ${email}:`, list);
    return list;
  } catch (err) {
    console.error("[LOCAL STORE GET FAILED]:", err);
    return [];
  }
}

export function getBookingById(email, id) {
  const all = getBookings(email);
  const found = all.find((item) => item.bookingId === id) || null;
  console.log(`📥 [LOCAL STORE GET /bookings/${id}] Booking:`, found);
  return found;
}

// ----------------------------------------------------
// 2. POST (Create / Save)
// ----------------------------------------------------
export function saveBooking(email, booking) {
  console.log(`📤 [LOCAL STORE POST /bookings] Creating booking for ${email}:`, booking);
  const existing = getBookings(email);
  const next = [booking, ...existing.filter((item) => item.bookingId !== booking.bookingId)];
  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    console.log(`✅ [LOCAL STORE POST /bookings] Successfully stored booking:`, booking);
    return true;
  } catch (err) {
    console.error("[LOCAL STORE POST FAILED]:", err);
    return false;
  }
}

export const createBooking = saveBooking;

// ----------------------------------------------------
// 3. UPDATE / PUT / PATCH (Update)
// ----------------------------------------------------
export function updateBooking(email, id, updatedFields) {
  console.log(`🔄 [LOCAL STORE UPDATE /bookings/${id}] Updating booking for ${email}:`, updatedFields);
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
    console.warn(`⚠️ [LOCAL STORE UPDATE] Booking ${id} not found.`);
    return null;
  }

  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    console.log(`✅ [LOCAL STORE UPDATE /bookings/${id}] Booking updated:`, updatedItem);
    return updatedItem;
  } catch (err) {
    console.error("[LOCAL STORE UPDATE FAILED]:", err);
    return null;
  }
}

// ----------------------------------------------------
// 4. DELETE (Remove / Cancel)
// ----------------------------------------------------
export function deleteBooking(email, id, softDelete = true) {
  console.log(`🗑️ [LOCAL STORE DELETE /bookings/${id}] Cancelling/deleting booking for ${email}...`);
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
    console.log(`✅ [LOCAL STORE DELETE /bookings/${id}] Booking successfully deleted/cancelled.`);
    return true;
  } catch (err) {
    console.error("[LOCAL STORE DELETE FAILED]:", err);
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
