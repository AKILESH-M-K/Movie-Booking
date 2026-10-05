import { createSlice } from "@reduxjs/toolkit";

const emptyCustomer = { name: "", email: "", phone: "" };
const emptyPayment = { method: "UPI", upiId: "", cardNumber: "", expiry: "", cvv: "" };

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
    const saved = JSON.parse(localStorage.getItem("cinebookReduxBookingDraft"));
    if (!saved) return base;
    return { ...base, ...saved, payment: emptyPayment };
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
      if (state.selectedSeats.length < 8) state.selectedSeats.push(seatId);
    },
    removeSeat(state, action) {
      state.selectedSeats = state.selectedSeats.filter((id) => id !== action.payload);
    },
    updateCustomer(state, action) {
      const { field, value } = action.payload;
      state.customer[field] = value;
    },
    updatePayment(state, action) {
      const { field, value } = action.payload;
      state.payment[field] = value;
    },
    hydrateBooking(state, action) {
      return { ...getInitialState(), ...action.payload, payment: emptyPayment };
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
  updatePayment,
  hydrateBooking,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
