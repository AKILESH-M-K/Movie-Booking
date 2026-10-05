import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function buildQrUrl(booking) {
  const payload = JSON.stringify({
    bookingId: booking.bookingId,
    movie: booking.movie,
    theatre: booking.theatre,
    show: booking.show,
    seats: booking.seats,
  });

  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(payload)}`;
}

function Bookings() {
  const { user } = useAuth();
  let booking = null;

  try {
    const saved = localStorage.getItem(`cinebookBooking:${user?.email}`);
    booking = saved ? JSON.parse(saved) : null;
  } catch {
    booking = null;
  }

  return (
    <main className="min-h-[calc(100vh-150px)] bg-[#f9f4e4] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">
          Digital Ticket
        </p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">My Bookings</h1>
        <p className="mt-3 text-lg leading-8 text-[#736956]">
          Keep your QR ticket ready when entering the theatre.
        </p>

        {!booking ? (
          <div className="mt-9 rounded-2xl border border-dashed border-[#e0d5bc] bg-[#fffcf5] p-10 text-center">
            <div className="text-4xl">🎟️</div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">
              No bookings yet
            </h2>
            <p className="mt-2 text-base leading-7 text-[#7e715b]">
              Choose a movie and complete the booking flow to see your digital
              ticket here.
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex rounded-xl bg-[#a4652a] px-6 py-3.5 text-base font-black text-white transition-all hover:-translate-y-1 hover:bg-[#875022] hover:shadow-lg"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="mt-9 overflow-hidden rounded-3xl border border-[#eae3cc] bg-[#fffef7] shadow-[0_18px_45px_rgba(82,60,42,0.12)]">
            <div className="border-b border-[#efe8d6] bg-[#fcf7e9] px-7 py-6 sm:px-9">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">
                    Booking ID
                  </p>
                  <p className="mt-1 text-xl font-black text-[#a4652a]">
                    {booking.bookingId}
                  </p>
                </div>
                <span className="rounded-full bg-[#e6eadc] px-4 py-2 text-sm font-black text-[#596341]">
                  ✓ Confirmed
                </span>
              </div>
            </div>

            <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-3xl font-black text-[#3d3324]">
                  {booking.movie}
                </h2>
                <p className="mt-2 text-base font-bold text-[#7e715b]">
                  {booking.theatre} · {booking.show}
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Info label="Theatre" value={booking.theatre} />
                  <Info label="Show" value={booking.show} />
                  <Info
                    label="Seat Number(s)"
                    value={booking.seats?.join(", ")}
                    highlight
                  />
                  <Info label="Amount Paid" value={`₹${booking.amount}`} />
                  <Info label="Payment" value={booking.paymentMethod} />
                  <Info
                    label="Booked At"
                    value={new Date(booking.bookedAt).toLocaleString()}
                  />
                </div>

                <div className="mt-7 rounded-2xl border border-[#e6dcc4] bg-[#fcf8ec] p-5">
                  <p className="text-sm font-black uppercase tracking-wide text-[#9a7547]">
                    Entry instructions
                  </p>
                  <p className="mt-2 text-base font-bold leading-7 text-[#594d3b]">
                    Show this QR code and your seat number at the theatre
                    entrance. Keep the booking ID available if staff need to
                    verify your reservation.
                  </p>
                </div>
              </div>

              <aside className="flex flex-col items-center rounded-3xl border border-[#ebe2cd] bg-[#fcf8ec] p-5 text-center">
                <p className="text-sm font-black uppercase tracking-[0.15em] text-[#9a7547]">
                  Scan at Entry
                </p>
                <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                  <img
                    src={buildQrUrl(booking)}
                    alt={`QR ticket for booking ${booking.bookingId}`}
                    className="h-52 w-52"
                  />
                </div>
                <p className="mt-4 text-xs font-bold leading-5 text-[#847960]">
                  QR contains only your booking ID, movie, theatre, show and
                  seat numbers.
                </p>
                <p className="mt-4 text-sm font-black text-[#a4652a]">
                  Seats: {booking.seats?.join(", ")}
                </p>
              </aside>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="rounded-xl border border-[#ece6d2] bg-[#fcf8ec] p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-bold leading-6 ${highlight ? "text-[#a4652a]" : "text-[#4b3f2d]"}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default Bookings;
