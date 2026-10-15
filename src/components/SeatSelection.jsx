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
    <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-1.5 text-base font-medium font-sans text-ink-secondary hover:text-brand transition"
        >
          ← Back to Show Timing
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary font-sans">
          Step 4 of 6 · Seat map
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary">
          Select Your Seats
        </h1>
        <p className="mt-3 text-base leading-7 text-ink-secondary font-sans">
          {bookedSeats.length} seats are already booked for this show. Choose up to {MAX_SEATS_PER_BOOKING} seats.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-brand/20 bg-brand-light px-4 py-3 text-sm font-semibold text-brand font-sans"
          >
            {message}
          </p>
        )}

        <section
          aria-labelledby="seat-map-title"
          className="mt-9 rounded-2xl border border-canvas-muted bg-surface p-6 shadow-cozy sm:p-8"
        >
          <h2 id="seat-map-title" className="sr-only font-serif">
            Seat map
          </h2>

          {/* Screen illustration */}
          <div className="relative mx-auto max-w-2xl text-center">
            <div
              className="mx-auto h-2 max-w-xl rounded-full bg-ink-primary/20 shadow-inner"
              aria-hidden="true"
            />
            <div
              className="mt-2 inline-block rounded-full bg-ink-primary px-6 py-1.5 text-center text-[11px] font-bold tracking-[0.3em] text-canvas shadow-sm"
              aria-hidden="true"
            >
              SCREEN
            </div>
          </div>

          <div ref={seatMapRef} className="mx-auto mt-10 max-w-3xl overflow-x-auto pb-4">
            <div className="min-w-[590px] space-y-3">
              {seatRows.map(({ row, type }) => (
                <div key={row} className="flex items-center gap-3">
                  <span
                    className="w-7 text-center font-sans text-sm font-bold text-ink-secondary"
                    aria-hidden="true"
                  >
                    {row}
                  </span>
                  <div
                    className="grid flex-1 grid-cols-10 gap-2.5"
                    role="group"
                    aria-label={`Row ${row}, ${seatCategories[type].label}, ₹${priceFor(type)} per seat`}
                  >
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

          {/* Legend */}
          <ul
            className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-canvas-muted/60 pt-6 font-sans text-xs font-semibold text-ink-secondary"
            aria-label="Seat legend"
          >
            <li className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-md border border-canvas-muted bg-seat-available" />
              Regular (₹{priceFor("Regular")})
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-md border border-canvas-muted bg-seat-available ring-1 ring-amber/50" />
              Premium (₹{priceFor("Premium")})
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-md bg-brand" />
              Selected
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-md border border-canvas-muted bg-seat-booked line-through" />
              Booked
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-4 border-t border-canvas-muted pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                Selected seats
              </p>
              <p
                className="mt-1 font-sans text-xl font-bold text-brand"
                aria-live="polite"
                aria-atomic="true"
              >
                {selectedSeatCount ? selectedSeats.join(", ") : "None"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedSeatCount}
              className="rounded-xl bg-brand px-7 py-4 font-sans text-base font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
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
