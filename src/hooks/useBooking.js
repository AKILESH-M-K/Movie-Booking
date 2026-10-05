import { useDispatch, useSelector } from "react-redux";
import {
  clearBooking,
  removeSeat,
  selectMovie,
  selectSeat,
  selectShow,
  selectTheatre,
  updateCustomer,
  updatePayment,
} from "../store/bookingSlice";
import { seats } from "../data/bookingData";
import {
  sanitizeCardNumber,
  sanitizeCvv,
  sanitizeExpiry,
  sanitizeName,
  sanitizePhone,
  sanitizeUpi,
} from "../utils/validation";

export default function useBooking() {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);

  const selectedSeatObjects = seats.filter((seat) => booking.selectedSeats.includes(seat.id));
  const selectedSeatCount = booking.selectedSeats.length;
  const ticketPrice = selectedSeatObjects.reduce(
    (total, seat) => total + (booking.selectedMovie?.price ?? 0) + (seat.type === "Premium" ? 50 : 0),
    0,
  );
  const convenienceCharge = selectedSeatCount * 25;
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
    updateCustomer: (field, value) => {
      const safeValue = field === "name"
        ? sanitizeName(value)
        : field === "phone"
          ? sanitizePhone(value)
          : String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 254);
      dispatch(updateCustomer({ field, value: safeValue }));
    },
    updatePayment: (field, value) => {
      let safeValue = String(value ?? "");
      if (field === "upiId") safeValue = sanitizeUpi(safeValue);
      if (field === "cardNumber") safeValue = sanitizeCardNumber(safeValue);
      if (field === "expiry") safeValue = sanitizeExpiry(safeValue);
      if (field === "cvv") safeValue = sanitizeCvv(safeValue);
      dispatch(updatePayment({ field, value: safeValue }));
    },
    clearBooking: () => dispatch(clearBooking()),
  };
}
