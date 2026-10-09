import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import bookingReducer, { selectMovie, selectSeat } from "../store/bookingSlice";
import useBooking from "../hooks/useBooking";
import bookingMiddleware from "../store/bookingMiddleware";

function makeStore() {
  return configureStore({
    reducer: { booking: bookingReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(bookingMiddleware),
  });
}

test("calculates ticket price, seat surcharge, convenience fee and total", () => {
  const store = makeStore();
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => useBooking(), { wrapper });

  act(() => {
    store.dispatch(selectMovie({ id: 101, title: "Interstellar", price: 250 }));
    store.dispatch(selectSeat("A1")); // Premium seat: ₹250 + ₹50
    store.dispatch(selectSeat("C1")); // Regular seat: ₹250
  });

  expect(result.current.selectedSeatCount).toBe(2);
  expect(result.current.ticketPrice).toBe(550);
  expect(result.current.convenienceCharge).toBe(50);
  expect(result.current.totalAmount).toBe(600);
});

test("toggles a selected seat off when clicked again", () => {
  const store = makeStore();
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => useBooking(), { wrapper });
  act(() => {
    store.dispatch(selectMovie({ id: 101, title: "Interstellar", price: 250 }));
    store.dispatch(selectSeat("C1"));
  });
  expect(result.current.selectedSeats).toContain("C1");
  act(() => store.dispatch(selectSeat("C1")));
  expect(result.current.selectedSeats).not.toContain("C1");
});
