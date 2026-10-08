import { useDispatch, useSelector } from "react-redux";
import {
  clearBooking,
  prefillCustomer,
  removeSeat,
  selectMovie,
  selectSeat,
  selectShow,
  selectTheatre,
  updateCustomer,
  updatePayment,
} from "../store/bookingSlice";
import { seatCategories, seats } from "../data/bookingData";
import { sanitizeName, sanitizePhone, sanitizeText, sanitizeUpi } from "../utils/validation";

export const CONVENIENCE_FEE_PER_SEAT = 25;

export default function useBooking() {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);

  const selectedSeatObjects = seats.filter((seat) => booking.selectedSeats.includes(seat.id));
  const selectedSeatCount = selectedSeatObjects.length;
  const basePrice = booking.selectedMovie?.price ?? 0;

  const ticketPrice = selectedSeatObjects.reduce(
    (total, seat) => total + basePrice + (seatCategories[seat.type]?.surcharge ?? 0),
    0,
  );
  const convenienceCharge = selectedSeatCount * CONVENIENCE_FEE_PER_SEAT;
  const totalAmount = ticketPrice + convenienceCharge;

  return {
    ...booking,
    selectedSeatObjects,
    selectedSeatCount,
    ticketPrice,
    convenienceCharge,
    totalAmount,
    selectMovie: (movie) => dispatch(selectMovie(movie)),
    selectTheatre: (theatre) => dispatch(selectTheatre(theatre)),
    selectShow: (show) => dispatch(selectShow(show)),
    selectSeat: (seatId) => dispatch(selectSeat(seatId)),
    removeSeat: (seatId) => dispatch(removeSeat(seatId)),
    prefillCustomer: (profile) => dispatch(prefillCustomer(profile)),
    updateCustomer: (field, value) => {
      const safeValue =
        field === "name"
          ? sanitizeName(value)
          : field === "phone"
            ? sanitizePhone(value)
            : sanitizeText(value, 254);
      dispatch(updateCustomer({ field, value: safeValue }));
    },
    updatePayment: (field, value) => {
      // Only the payment method and UPI ID are stored client-side.
      const safeValue = field === "upiId" ? sanitizeUpi(value) : String(value ?? "");
      dispatch(updatePayment({ field, value: safeValue }));
    },
    clearBooking: () => dispatch(clearBooking()),
  };
}
