const DRAFT_KEY = "cinebookReduxBookingDraft";

const PERSISTED_ACTIONS = new Set([
  "booking/selectMovie",
  "booking/selectTheatre",
  "booking/selectShow",
  "booking/selectSeat",
  "booking/removeSeat",
  "booking/updateCustomer",
  "booking/prefillCustomer",
]);

const bookingMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "booking/clearBooking") {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Storage failure must not break booking actions.
    }
    return result;
  }

  if (PERSISTED_ACTIONS.has(action.type)) {
    const state = store.getState().booking;
    // Payment details are never persisted. Contact details are kept only so a
    // refresh mid-checkout does not lose the draft.
    const safeDraft = {
      selectedMovie: state.selectedMovie,
      selectedTheatre: state.selectedTheatre,
      selectedShow: state.selectedShow,
      selectedSeats: state.selectedSeats,
      customer: state.customer,
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft));
    } catch {
      // Storage failure must not break booking actions.
    }
  }

  return result;
};

export default bookingMiddleware;
