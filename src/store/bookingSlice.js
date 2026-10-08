import { createSlice } from "@reduxjs/toolkit";
import { MAX_SEATS_PER_BOOKING } from "../data/bookingData";

const emptyCustomer = { name: "", email: "", phone: "" };
const emptyPayment = { method: "UPI", upiId: "" };

const DRAFT_KEY = "cinebookReduxBookingDraft";

const getInitialState = () => {
  const base = {
    selectedMovie: null,
    selectedTheatre: null,
    selectedShow: null,
    selectedSeats: [],
    customer: emptyCustomer,
    payment: emptyPayment,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!saved || typeof saved !== "object") return base;
    return {
      ...base,
      selectedMovie: saved.selectedMovie ?? null,
      selectedTheatre: saved.selectedTheatre ?? null,
      selectedShow: saved.selectedShow ?? null,
      selectedSeats: Array.isArray(saved.selectedSeats) ? saved.selectedSeats : [],
      customer: { ...emptyCustomer, ...(saved.customer || {}) },
      payment: emptyPayment,
    };
  } catch {
    return base;
  }
};

const initialState = getInitialState();

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    selectMovie(state, action) {
      state.selectedMovie = action.payload;
      state.selectedTheatre = null;
      state.selectedShow = null;
      state.selectedSeats = [];
    },
    selectTheatre(state, action) {
      state.selectedTheatre = action.payload;
      state.selectedShow = null;
      state.selectedSeats = [];
    },
    selectShow(state, action) {
      state.selectedShow = action.payload;
      state.selectedSeats = [];
    },
    selectSeat(state, action) {
      const seatId = action.payload;
      if (state.selectedSeats.includes(seatId)) {
        state.selectedSeats = state.selectedSeats.filter((id) => id !== seatId);
        return;
      }
      if (state.selectedSeats.length < MAX_SEATS_PER_BOOKING) state.selectedSeats.push(seatId);
    },
    removeSeat(state, action) {
      state.selectedSeats = state.selectedSeats.filter((id) => id !== action.payload);
    },
    updateCustomer(state, action) {
      const { field, value } = action.payload;
      state.customer[field] = value;
    },
    prefillCustomer(state, action) {
      // Fills contact details from the signed-in profile without overwriting
      // anything the user has already edited during this checkout.
      const profile = action.payload || {};
      state.customer = {
        name: state.customer.name || profile.name || "",
        email: state.customer.email || profile.email || "",
        phone: state.customer.phone || profile.phone || "",
      };
    },
    updatePayment(state, action) {
      const { field, value } = action.payload;
      state.payment[field] = value;
    },
    clearBooking() {
      return {
        ...initialState,
        customer: emptyCustomer,
        payment: emptyPayment,
      };
    },
  },
});

export const {
  selectMovie,
  selectTheatre,
  selectShow,
  selectSeat,
  removeSeat,
  updateCustomer,
  prefillCustomer,
  updatePayment,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
