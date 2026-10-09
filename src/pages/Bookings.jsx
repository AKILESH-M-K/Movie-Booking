import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  getBookings,
  migrateLegacyBooking,
  updateBooking as updateLocalBooking,
  deleteBooking as deleteLocalBooking,
} from "../utils/bookingStore";
import {
  cancelBooking,
  fetchBookingHistory,
  updateBooking,
} from "../api/bookingApi";
import { API_ENABLED, apiError } from "../api/apiClient";
import QrTicket from "../components/QrTicket";

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function Bookings() {
  const { user } = useAuth();
  const location = useLocation();
  const newBookingId = location.state?.newBookingId;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (API_ENABLED) {
        setBookings(await fetchBookingHistory());
      } else {
        migrateLegacyBooking(user?.email);
        setBookings(getBookings(user?.email));
      }
    } catch (err) {
      setError(apiError(err, "Could not load booking history."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        if (API_ENABLED) {
          const list = await fetchBookingHistory();
          if (!ignore) {
            setBookings(list);
            setLoading(false);
          }
        } else {
          migrateLegacyBooking(user?.email);
          if (!ignore) {
            setBookings(getBookings(user?.email));
            setLoading(false);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(apiError(err, "Could not load booking history."));
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [user]);

  const editCustomer = async (booking) => {
    const name = window.prompt(
      "Update customer name:",
      booking.customer?.name || user?.name || "",
    );
    if (name === null) return;
    const email = window.prompt(
      "Update customer email:",
      booking.customer?.email || user?.email || "",
    );
    if (email === null) return;
    const phone = window.prompt(
      "Update customer phone:",
      booking.customer?.phone || user?.phone || "",
    );
    if (phone === null) return;
    setActionId(booking.bookingId);
    setError("");
    setNotice("");
    try {
      if (API_ENABLED) {
        await updateBooking(booking.bookingId, { name, email, phone }, "PATCH");
        await loadBookings();
      } else {
        updateLocalBooking(user.email, booking.bookingId, {
          customer: { name, email, phone },
        });
        setBookings(getBookings(user.email));
      }
      setNotice("Booking details updated.");
    } catch (err) {
      setError(apiError(err, "Could not update booking."));
    } finally {
      setActionId("");
    }
  };

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel booking ${booking.bookingId}?`)) return;
    setActionId(booking.bookingId);
    setError("");
    setNotice("");
    try {
      if (API_ENABLED) {
        await cancelBooking(booking.bookingId);
        await loadBookings();
      } else {
        deleteLocalBooking(user.email, booking.bookingId);
        setBookings(getBookings(user.email));
      }
      setNotice("Booking cancelled.");
    } catch (err) {
      setError(apiError(err, "Could not cancel booking."));
    } finally {
      setActionId("");
    }
  };

  return (
    <main className="min-h-[calc(100vh-150px)] bg-[#f6f8fb] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">
          Your tickets
        </p>
        <h1 className="mt-2 text-4xl font-black text-[#14213d]">My Bookings</h1>
        <p className="mt-3 text-lg leading-8 text-[#667085]">
          View, update customer details, or cancel your bookings.
        </p>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-[#b8e0d2] bg-[#e6f5ef] px-4 py-3 text-sm font-bold text-[#147d61]"
          >
            {notice}
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {error}
            <button className="ml-3 underline" onClick={loadBookings}>
              Retry
            </button>
          </div>
        )}
        {newBookingId && (
          <div className="ticket-success" role="status">
            <span className="ticket-success-icon" aria-hidden="true">✓</span>
            <div>
              <strong>Payment successful. Your ticket is ready.</strong>
              <p>Show the QR code at the theatre entrance for a quick check-in.</p>
            </div>
          </div>
        )}
        {loading ? (
          <p className="mt-8 rounded-xl bg-[#ffffff] p-8 text-center font-bold text-[#667085]">
            Loading booking history…
          </p>
        ) : !bookings.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#ffffff] p-10 text-center">
            <div className="text-4xl" aria-hidden="true">
              🎟️
            </div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">
              No bookings yet
            </h2>
            <p className="mt-2 text-base leading-7 text-[#667085]">
              Choose a movie and complete the booking flow to see your tickets
              here.
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex rounded-xl bg-[#e4572e] px-6 py-3.5 text-base font-black text-white transition-all hover:-translate-y-1 hover:bg-[#c94423]"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <ul className="mt-9 space-y-6">
            {bookings.map((booking) => (
              <li key={booking.bookingId}>
                <article className={`ticket-card overflow-hidden rounded-3xl border bg-white shadow-[0_18px_45px_rgba(20,33,61,0.10)] ${newBookingId === booking.bookingId ? "ticket-card-new" : ""}`}>
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4e7ec] bg-[#f7f9fc] px-7 py-6 sm:px-9">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#98a2b3]">
                        Booking ID
                      </p>
                      <p className="mt-1 font-mono text-xl font-black text-[#e4572e]">
                        {booking.bookingId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${booking.status === "cancelled" ? "bg-red-100 text-red-800" : booking.status === "paid" ? "bg-[#e6f5ef] text-[#147d61]" : "bg-[#eef1f7] text-[#475467]"}`}
                    >
                      {booking.status === "cancelled" ? "Cancelled" : booking.status === "paid" ? "✓ Paid" : "Confirmed"}
                    </span>
                  </header>
                  <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_260px]">
                    <div>
                      <h2 className="text-3xl font-black text-[#14213d]">
                        {booking.movie}
                      </h2>
                      <p className="mt-2 text-base font-bold text-[#667085]">
                        {booking.theatre} · {booking.show}
                      </p>
                      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                        <Info
                          label="Seats"
                          value={booking.seats?.join(", ")}
                          highlight
                        />
                        <Info label="Amount" value={`₹${booking.amount}`} />
                        <Info label="Payment" value={booking.paymentMethod} />
                        <Info
                          label="Booked at"
                          value={formatDateTime(booking.bookedAt)}
                        />
                        <Info label="Customer" value={booking.customer?.name} />
                        <Info label="Email" value={booking.customer?.email} />
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          disabled={
                            !!actionId || booking.status === "cancelled"
                          }
                          onClick={() => editCustomer(booking)}
                          className="rounded-lg border border-[#cdbb9d] px-4 py-2 text-sm font-bold text-[#344054] disabled:opacity-50"
                        >
                          {actionId === booking.bookingId
                            ? "Working…"
                            : "Edit customer details"}
                        </button>
                        <button
                          disabled={
                            !!actionId || booking.status === "cancelled"
                          }
                          onClick={() => cancel(booking)}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
                        >
                          Cancel booking
                        </button>
                      </div>
                    </div>
                    <aside className="rounded-3xl border border-[#e4e7ec] bg-[#f7f9fc] p-5 text-center">
                      {booking.status === "paid" ? <QrTicket booking={booking} /> : <p className="text-sm font-bold leading-6 text-[#667085]">Payment is still pending. Your QR ticket will appear once payment is complete.</p>}
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
    <div className="rounded-xl border border-[#e4e7ec] bg-[#f8fafc] p-4">
      <dt className="text-sm font-bold uppercase tracking-wide text-[#98a2b3]">
        {label}
      </dt>
      <dd
        className={`mt-1 text-base font-bold leading-6 ${highlight ? "text-[#e4572e]" : "text-[#344054]"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
export default Bookings;
