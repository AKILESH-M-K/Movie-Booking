const PERSISTED_ACTIONS = new Set([
  "booking/selectMovie",
  "booking/selectTheatre",
  "booking/selectShow",
  "booking/selectSeat",
  "booking/removeSeat",
  "booking/updateCustomer",
]);

const bookingMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "booking/clearBooking") {
    try {
      localStorage.removeItem("cinebookReduxBookingDraft");
    } catch {
      // Storage failure must not break booking actions.
    }
    return result;
  }

  if (PERSISTED_ACTIONS.has(action.type)) {
    const state = store.getState().booking;
    const safeDraft = {
      selectedMovie: state.selectedMovie,
      selectedTheatre: state.selectedTheatre,
      selectedShow: state.selectedShow,
      selectedSeats: state.selectedSeats,
      customer: state.customer,
    };

    try {
      localStorage.setItem("cinebookReduxBookingDraft", JSON.stringify(safeDraft));
      console.info(`[Booking Middleware] ${action.type}`, action.payload);
    } catch {
      // Storage failure must not break booking actions.
    }
  }

  return result;
};

export default bookingMiddleware;
