import { useRef, useState } from "react";
import useBooking from "../hooks/useBooking";
import Seat from "./common/Seat";
import { getBookedSeats } from "../utils/availability";
import { MAX_SEATS_PER_BOOKING, seatRows, seatCategories } from "../data/bookingData";

function SeatSelection({ onContinue, onBack }) {
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    selectedSeatCount,
    selectSeat,
  } = useBooking();
  const [message, setMessage] = useState("");
  const seatMapRef = useRef(null);

  // Arrow keys move through the seat grid while native Tab/Shift+Tab remain available.
  const handleSeatKeyDown = (event, seat) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10 };
    const move = moves[event.key];
    if (!move) return;
    const match = seat.id.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;
    const row = match[1].charCodeAt(0) - 65;
    const column = Number(match[2]) - 1;
    const rowStep = move / 10;
    const columnStep = Math.abs(move) === 1 ? move : 0;
    let nextRow = row + rowStep;
    let nextColumn = column + columnStep;
    while (nextRow >= 0 && nextRow < seatRows.length && nextColumn >= 0 && nextColumn < 10) {
      const rowLabel = String.fromCharCode(65 + nextRow);
      const target = seatMapRef.current?.querySelector(`[data-seat-id="${rowLabel}${nextColumn + 1}"]:not(:disabled)`);
      if (target) {
        event.preventDefault();
        target.focus();
        return;
      }
      nextRow += rowStep;
      nextColumn += columnStep;
    }
  };

  const bookedSeats = getBookedSeats(selectedMovie, selectedTheatre, selectedShow);
  const basePrice = selectedMovie?.price ?? 0;

  const priceFor = (type) => basePrice + (seatCategories[type]?.surcharge ?? 0);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat.id)) return;

    if (!selectedSeats.includes(seat.id) && selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
      setMessage(`You can select up to ${MAX_SEATS_PER_BOOKING} seats per booking.`);
      return;
    }

    setMessage("");
    selectSeat(seat.id);
  };

  const handleContinue = () => {
    if (!selectedSeatCount) {
      setMessage("Please select at least one available seat.");
      return;
    }

    // Re-check against current availability: another booking may have taken a seat.
    const conflicts = selectedSeats.filter((seat) => bookedSeats.includes(seat));
    if (conflicts.length) {
      setMessage(`Seat ${conflicts.join(", ")} was just booked. Please choose another seat.`);
      return;
    }

    onContinue();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#667085] hover:text-[#e4572e]">
          ← Back to Show Timing
        </button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">Step 4 of 6 · Seat map</p>
        <h1 className="mt-2 text-4xl font-black text-[#14213d]">Select Your Seats</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          {bookedSeats.length} seats are already booked for this show. Choose up to {MAX_SEATS_PER_BOOKING} seats.
        </p>

        {message && (
          <p role="alert" className="mt-5 rounded-xl border border-[#f7c8bb] bg-[#fff7f4] px-4 py-3 text-sm font-bold text-[#9f5525]">
            {message}
          </p>
        )}

        <section aria-labelledby="seat-map-title" className="mt-9 rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-5 shadow-sm sm:p-8">
          <h2 id="seat-map-title" className="sr-only">Seat map</h2>
          <div className="mx-auto max-w-2xl rounded-full bg-[#1d3557] py-2 text-center text-xs font-black tracking-[0.3em] text-[#fdf3e1]" aria-hidden="true">
            SCREEN
          </div>

          <div ref={seatMapRef} className="mx-auto mt-10 max-w-3xl overflow-x-auto pb-3">
            <div className="min-w-[590px] space-y-3">
              {seatRows.map(({ row, type }) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-7 text-center text-sm font-black text-[#667085]" aria-hidden="true">{row}</span>
                  <div className="grid flex-1 grid-cols-10 gap-2" role="group" aria-label={`Row ${row}, ${seatCategories[type].label}, ₹${priceFor(type)} per seat`}>
                    {Array.from({ length: 10 }, (_, index) => {
                      const seat = { id: `${row}${index + 1}`, type };
                      const booked = bookedSeats.includes(seat.id);
                      return (
                        <Seat
                          key={seat.id}
                          seat={seat}
                          selected={selectedSeats.includes(seat.id)}
                          disabled={booked}
                          booked={booked}
                          price={priceFor(type)}
                          onClick={() => handleSeatClick(seat)}
                          onKeyDown={(event) => handleSeatKeyDown(event, seat)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-5 text-sm font-bold text-[#667085]" aria-label="Seat legend">
            <li>Regular ₹{priceFor("Regular")}</li>
            <li>Premium ₹{priceFor("Premium")}</li>
            <li>Selected</li>
            <li>Booked</li>
          </ul>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#e4e7ec] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#98a2b3]">Selected seats</p>
              <p className="mt-1 text-lg font-black text-[#e4572e]" aria-live="polite" aria-atomic="true">
                {selectedSeatCount ? selectedSeats.join(", ") : "None"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedSeatCount}
              className="rounded-xl bg-[#e4572e] px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#c94423] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue to Summary →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SeatSelection;
