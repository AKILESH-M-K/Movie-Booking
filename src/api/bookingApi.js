import { apiClient } from "./apiClient";

/**
 * Booking CRUD API Functions
 * Provides GET, POST, UPDATE, DELETE operations with console output logging.
 */

// ----------------------------------------------------
// 1. GET (Read all bookings & Read by ID)
// ----------------------------------------------------
export async function fetchBookingHistory() {
  console.log("📥 [CRUD GET /bookings] Fetching all booking history...");
  const { data } = await apiClient.get("/bookings");
  console.log("✅ [CRUD GET /bookings] Retrieved bookings:", data);
  return data;
}

export async function getBookingById(id) {
  console.log(`📥 [CRUD GET /bookings/${id}] Fetching booking by ID...`);
  const { data } = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
  console.log(`✅ [CRUD GET /bookings/${id}] Retrieved booking details:`, data);
  return data;
}

// ----------------------------------------------------
// 2. POST (Create new booking)
// ----------------------------------------------------
export async function createBooking(booking) {
  console.log("📤 [CRUD POST /bookings] Creating new booking ticket:", booking);
  const { data } = await apiClient.post("/bookings", booking);
  console.log("✅ [CRUD POST /bookings] Ticket successfully created:", data);
  return data;
}

// ----------------------------------------------------
// 3. UPDATE / PUT / PATCH (Update booking details)
// ----------------------------------------------------
export async function updateBooking(id, updateData, method = "PATCH") {
  console.log(
    `🔄 [CRUD UPDATE ${method} /bookings/${id}] Updating booking with:`,
    updateData,
  );
  const payload =
    updateData?.customer !== undefined || updateData?.status !== undefined
      ? updateData
      : { customer: updateData };

  const { data } = await apiClient.request({
    url: `/bookings/${encodeURIComponent(id)}`,
    method,
    data: payload,
  });
  console.log(
    `✅ [CRUD UPDATE ${method} /bookings/${id}] Booking successfully updated:`,
    data,
  );
  return data;
}

// ----------------------------------------------------
// 4. DELETE (Cancel / Delete booking)
// ----------------------------------------------------
export async function cancelBooking(id) {
  console.log(
    `🗑️ [CRUD DELETE /bookings/${id}] Cancelling/deleting booking ticket...`,
  );
  const { data } = await apiClient.delete(
    `/bookings/${encodeURIComponent(id)}`,
  );
  console.log(
    `✅ [CRUD DELETE /bookings/${id}] Booking cancelled/deleted:`,
    data,
  );
  return data;
}

// Payment helper
export async function authorizePayment(payment) {
  console.log(
    "💳 [PAYMENT POST /payments/authorize] Authorizing payment:",
    payment,
  );
  const { data } = await apiClient.post("/payments/authorize", payment);
  console.log("✅ [PAYMENT POST /payments/authorize] Authorized:", data);
  return data;
}

// Aliases matching standard CRUD terminology
export const getBookings = fetchBookingHistory;
export const postBooking = createBooking;
export const deleteBooking = cancelBooking;
