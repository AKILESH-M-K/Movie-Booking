import { apiClient } from "./apiClient";

export async function fetchBookingHistory() {
  const { data } = await apiClient.get("/bookings");
  return data;
}

export async function fetchAvailability({ movieId, theatre, show, date }) {
  const { data } = await apiClient.get("/availability", {
    params: { movieId, theatre, show, date },
  });
  return data;
}

export async function getBookingById(id) {
  const { data } = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
  return data;
}

export async function createBooking(booking, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const { data } = await apiClient.post("/bookings", booking, { headers });
  return data;
}

export async function updateBooking(id, updateData, method = "PATCH") {
  const payload =
    updateData?.customer !== undefined || updateData?.status !== undefined
      ? updateData
      : { customer: updateData };
  const { data } = await apiClient.request({
    url: `/bookings/${encodeURIComponent(id)}`,
    method,
    data: payload,
  });
  return data;
}

export async function cancelBooking(id) {
  const { data } = await apiClient.delete(`/bookings/${encodeURIComponent(id)}`);
  return data;
}

export async function authorizePayment(payment) {
  const { data } = await apiClient.post("/payments/authorize", payment);
  return data;
}

export const getBookings = fetchBookingHistory;
export const postBooking = createBooking;
export const deleteBooking = cancelBooking;
