import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";
import bookingMiddleware from "./bookingMiddleware";

export const store = configureStore({
  reducer: { booking: bookingReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bookingMiddleware),
});
