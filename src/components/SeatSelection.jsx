import useBooking from "../hooks/useBooking";
import Seat from "./common/Seat";
import { getBookedSeats } from "../utils/availability";

function SeatSelection({ onContinue, onBack }) {
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    selectedSeatCount,
    selectSeat,
  } = useBooking();

  const rows = ["F","E","D","C","B","A"];
  const seatsPerRow = 10;
  const bookedSeats = getBookedSeats(selectedMovie, selectedTheatre, selectedShow);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    selectSeat(seatId);
  };

  const handleContinue = () => {
    if (!selectedSeats.length) {
      alert("Please select at least one available seat.");
      return;
    }

    const conflicts = selectedSeats.filter((seat) => bookedSeats.includes(seat));
    if (conflicts.length) {
      alert(`Seat ${conflicts.join(", ")} was just booked. Please select another seat.`);
      return;
    }

    onContinue();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#7e715b] hover:text-[#a4652a]">← Back to Show Timing</button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">Step 4 of 6 · Live-style seat map</p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">Select Your Seats</h1>
        <p className="mt-3 text-base leading-7 text-[#736956]">
          {bookedSeats.length} seats are already booked for this movie, theatre and show. Choose up to 8 open seats.
        </p>

        <section className="mt-9 rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-5 shadow-sm sm:p-8">
          <div className="mx-auto max-w-2xl rounded-full bg-[#453928] py-2 text-center text-xs font-black tracking-[0.3em] text-[#fdf3e1] shadow-inner">SCREEN</div>
          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto pb-3">
            <div className="min-w-[590px] space-y-3">
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-7 text-center text-sm font-black text-[#9a7547]">{row}</span>
                  <div className="grid flex-1 grid-cols-10 gap-2">
                    {Array.from({ length: seatsPerRow }, (_, index) => {
                      const seat = { id: `${row}${index + 1}`, type: row === "A" || row === "B" ? "Premium" : "Regular" };
                      const booked = bookedSeats.includes(seat.id);
                      return (
                        <Seat
                          key={seat.id}
                          seat={seat}
                          selected={selectedSeats.includes(seat.id)}
                          disabled={booked}
                          booked={booked}
                          onClick={handleSeatClick}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm font-bold text-[#736956]">
            <span>🟫 Regular</span><span>🟧 Premium</span><span>🟥 Selected</span><span>⬛ Booked</span>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#efe8d6] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#9d8d71]">Selected Seats</p>
              <p className="mt-1 text-lg font-black text-[#a4652a]">{selectedSeatCount ? selectedSeats.join(", ") : "None"}</p>
            </div>
            <button type="button" onClick={handleContinue} className="rounded-xl bg-[#a4652a] px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#875022] hover:shadow-xl">Continue to Summary →</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SeatSelection;
