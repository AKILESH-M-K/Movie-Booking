import { useState } from "react";
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
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#7e715b] hover:text-[#a4652a]">
          ← Back to Show Timing
        </button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">Step 4 of 6 · Seat map</p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">Select Your Seats</h1>
        <p className="mt-3 text-base leading-7 text-[#736956]">
          {bookedSeats.length} seats are already booked for this show. Choose up to {MAX_SEATS_PER_BOOKING} seats.
        </p>

        {message && (
          <p role="alert" className="mt-5 rounded-xl border border-[#e8ccb1] bg-[#fff2e8] px-4 py-3 text-sm font-bold text-[#9f5525]">
            {message}
          </p>
        )}

        <section aria-labelledby="seat-map-title" className="mt-9 rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-5 shadow-sm sm:p-8">
          <h2 id="seat-map-title" className="sr-only">Seat map</h2>
          <div className="mx-auto max-w-2xl rounded-full bg-[#453928] py-2 text-center text-xs font-black tracking-[0.3em] text-[#fdf3e1]" aria-hidden="true">
            SCREEN
          </div>

          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto pb-3">
            <div className="min-w-[590px] space-y-3">
              {seatRows.map(({ row, type }) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-7 text-center text-sm font-black text-[#9a7547]" aria-hidden="true">{row}</span>
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
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-5 text-sm font-bold text-[#736956]" aria-label="Seat legend">
            <li>Regular ₹{priceFor("Regular")}</li>
            <li>Premium ₹{priceFor("Premium")}</li>
            <li>Selected</li>
            <li>Booked</li>
          </ul>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#efe8d6] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#9d8d71]">Selected seats</p>
              <p className="mt-1 text-lg font-black text-[#a4652a]">
                {selectedSeatCount ? selectedSeats.join(", ") : "None"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedSeatCount}
              className="rounded-xl bg-[#a4652a] px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#875022] disabled:cursor-not-allowed disabled:opacity-45"
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
