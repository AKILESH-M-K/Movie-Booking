import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getBookings, migrateLegacyBooking } from "../utils/bookingStore";

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    migrateLegacyBooking(user.email);
    setBookings(getBookings(user.email));
  }, [user?.email]);

  return (
    <main className="min-h-[calc(100vh-150px)] bg-[#f9f4e4] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">Your tickets</p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">My Bookings</h1>
        <p className="mt-3 text-lg leading-8 text-[#736956]">
          Show your booking ID and seat numbers at the theatre entrance.
        </p>

        {!bookings.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-[#e0d5bc] bg-[#fffcf5] p-10 text-center">
            <div className="text-4xl" aria-hidden="true">🎟️</div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">No bookings yet</h2>
            <p className="mt-2 text-base leading-7 text-[#7e715b]">
              Choose a movie and complete the booking flow to see your tickets here.
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex rounded-xl bg-[#a4652a] px-6 py-3.5 text-base font-black text-white transition-all hover:-translate-y-1 hover:bg-[#875022]"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <ul className="mt-9 space-y-6">
            {bookings.map((booking) => (
              <li key={booking.bookingId}>
                <article className="overflow-hidden rounded-3xl border border-[#eae3cc] bg-[#fffef7] shadow-[0_18px_45px_rgba(82,60,42,0.12)]">
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#efe8d6] bg-[#fcf7e9] px-7 py-6 sm:px-9">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">Booking ID</p>
                      <p className="mt-1 text-xl font-black text-[#a4652a]">{booking.bookingId}</p>
                    </div>
                    <span className="rounded-full bg-[#e6eadc] px-4 py-2 text-sm font-black text-[#596341]">✓ Confirmed</span>
                  </header>

                  <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_260px]">
                    <div>
                      <h2 className="text-3xl font-black text-[#3d3324]">{booking.movie}</h2>
                      <p className="mt-2 text-base font-bold text-[#7e715b]">
                        {booking.theatre} · {booking.show}
                      </p>

                      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                        <Info label="Seats" value={booking.seats?.join(", ")} highlight />
                        <Info label="Amount paid" value={`₹${booking.amount}`} />
                        <Info label="Payment" value={booking.paymentMethod} />
                        <Info label="Booked at" value={formatDateTime(booking.bookedAt)} />
                      </dl>
                    </div>

                    <aside className="rounded-3xl border border-[#ebe2cd] bg-[#fcf8ec] p-5 text-center">
                      <p className="text-sm font-black uppercase tracking-[0.15em] text-[#9a7547]">Entry</p>
                      <p className="mt-4 text-sm font-bold leading-6 text-[#594d3b]">
                        Show this booking ID at the entrance. Staff verify it against the seat numbers.
                      </p>
                      <p className="mt-4 break-all font-mono text-sm font-black text-[#a4652a]">{booking.bookingId}</p>
                    </aside>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="rounded-xl border border-[#ece6d2] bg-[#fcf8ec] p-4">
      <dt className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">{label}</dt>
      <dd className={`mt-1 text-base font-bold leading-6 ${highlight ? "text-[#a4652a]" : "text-[#4b3f2d]"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

export default Bookings;
