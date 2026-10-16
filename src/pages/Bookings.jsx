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

function mergeBookings(serverBookings, localBookings) {
  const fingerprint = (booking) =>
    [booking.movieId || booking.movie, booking.theatre, booking.showDate, booking.show, (booking.seats || []).slice().sort().join(",")]
      .map((value) => String(value || "").trim().toLowerCase())
      .join("|");
  const merged = [...(serverBookings || [])];
  for (const booking of localBookings || []) {
    if (!merged.some((item) => item.bookingId === booking.bookingId || fingerprint(item) === fingerprint(booking))) {
      merged.push(booking);
    }
  }
  return merged.sort((a, b) => (b.bookedAt || "").localeCompare(a.bookedAt || ""));
}

function hasVerifiedPayment(booking) {
  return booking.status === "paid" && Boolean(
    booking.paymentProvider && booking.providerTransactionId && booking.paymentVerifiedAt,
  );
}

function hasDemoConfirmation(booking) {
  return booking.status === "demo_confirmed" && booking.paymentMode === "demo"
    && Boolean(booking.demoConfirmedAt && booking.demoReference);
}

function canShowTicket(booking) {
  return hasVerifiedPayment(booking) || hasDemoConfirmation(booking);
}

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
        migrateLegacyBooking(user?.email);
        setBookings(mergeBookings(await fetchBookingHistory(), getBookings(user?.email)));
      } else {
        migrateLegacyBooking(user?.email);
        setBookings(getBookings(user?.email));
      }
    } catch (err) {
      setError(apiError(err, "Could not load booking history."));
      migrateLegacyBooking(user?.email);
      setBookings(getBookings(user?.email));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        if (API_ENABLED) {
          const list = mergeBookings(await fetchBookingHistory(), getBookings(user?.email));
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
          migrateLegacyBooking(user?.email);
          setBookings(getBookings(user?.email));
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
      if (API_ENABLED && booking.source !== "demo-local") {
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
      if (API_ENABLED && booking.source !== "demo-local") {
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
    <main className="min-h-[calc(100vh-150px)] bg-canvas px-5 py-12 font-sans text-ink-primary lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary">
          Your tickets
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary">
          My Bookings
        </h1>
        <p className="mt-3 font-sans text-base leading-7 text-ink-secondary">
          View, update customer details, or cancel your bookings.
        </p>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-brand/20 bg-brand-light px-4 py-3 font-sans text-sm font-semibold text-brand shadow-cozy"
          >
            {notice}
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-brand/20 bg-brand-light p-4 font-sans text-sm font-semibold text-brand"
          >
            {error}
            <button className="ml-3 underline font-bold" onClick={loadBookings}>
              Retry
            </button>
          </div>
        )}
        {newBookingId && (
          <div className="ticket-success" role="status">
            <span className="ticket-success-icon" aria-hidden="true">✓</span>
            <div>
              <strong>Payment was verified by the server. Your ticket is ready.</strong>
              <p>Scan the QR to read ticket data; it does not contain a website URL.</p>
            </div>
          </div>
        )}
        {loading ? (
          <p className="mt-8 rounded-2xl border border-canvas-muted bg-surface p-8 text-center font-sans font-medium text-ink-secondary shadow-cozy">
            Loading booking history…
          </p>
        ) : !bookings.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-10 text-center shadow-cozy">
            <div className="text-4xl" aria-hidden="true">
              🎟️
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-ink-primary">
              No bookings yet
            </h2>
            <p className="mt-2 font-sans text-base leading-7 text-ink-secondary">
              Choose a movie and complete the booking flow to see your tickets
              here.
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex rounded-xl bg-brand px-6 py-3.5 font-sans text-base font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99]"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <ul className="mt-9 space-y-6">
            {bookings.map((booking) => (
              <li key={booking.bookingId}>
                <article className={`overflow-hidden rounded-2xl border border-canvas-muted bg-surface shadow-cozy ${newBookingId === booking.bookingId ? "ticket-card-new ring-2 ring-brand/30" : ""}`}>
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-pink-200 bg-gradient-to-r from-pink-100 via-rose-50 to-white px-7 py-5 sm:px-8">
                    <div>
                      <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                        Booking ID
                      </p>
                      <p className="mt-1 font-mono text-xl font-bold text-brand">
                        {booking.bookingId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-1.5 font-sans text-xs font-bold ${
                        booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : hasVerifiedPayment(booking)
                            ? "bg-brand-light text-brand"
                            : hasDemoConfirmation(booking)
                              ? "bg-pink-100 text-pink-800"
                            : booking.status === "paid"
                              ? "bg-red-100 text-red-800"
                            : booking.status === "expired"
                              ? "bg-orange-100 text-orange-800"
                              : booking.status === "pending_payment"
                                ? "bg-amber/15 text-amber"
                                : "bg-canvas text-ink-secondary"
                      }`}
                    >
                      {booking.status === "cancelled" ? "Cancelled" : hasVerifiedPayment(booking) ? "✓ Payment verified · ticket ready" : hasDemoConfirmation(booking) ? "Demo confirmed · no charge" : booking.status === "paid" ? "Payment status unverified" : booking.status === "expired" ? "Expired" : booking.status === "pending_payment" ? "⏳ Pending Confirmation" : "Unverified"}
                    </span>
                  </header>
                  <div className="grid gap-8 bg-gradient-to-br from-white via-pink-50/50 to-rose-100/60 p-7 sm:p-8 lg:grid-cols-[1fr_260px]">
                    <div>
                      <div className="flex items-start gap-5">
                        {booking.movieImage && <img src={booking.movieImage} alt={`${booking.movie} poster`} className="h-36 w-24 shrink-0 rounded-xl object-cover shadow-poster ring-1 ring-pink-200 sm:h-44 sm:w-32" />}
                        <div className="min-w-0">
                          <p className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-pink-700">Your movie night</p>
                          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-ink-primary">{booking.movie}</h2>
                          <p className="mt-2 font-sans text-base font-medium text-ink-secondary">{booking.theatre} · {booking.showDate || "Date unavailable"} · {booking.show}</p>
                        </div>
                      </div>
                      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                        <Info
                          label="Seats"
                          value={booking.seats?.join(", ")}
                          highlight
                        />
                        <Info label={hasDemoConfirmation(booking) ? "Display amount · no charge" : "Amount"} value={`₹${booking.amount}`} />
                        <Info label="Payment" value={booking.paymentMethod} />
                        <Info
                          label="Booked at"
                          value={formatDateTime(booking.bookedAt)}
                        />
                        <Info label="Customer" value={booking.customer?.name} />
                        <Info label="Email" value={booking.customer?.email} />
                      </dl>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          disabled={
                            !!actionId || booking.status === "cancelled"
                          }
                          onClick={() => editCustomer(booking)}
                          className="rounded-xl border border-canvas-muted bg-surface px-4 py-2 font-sans text-xs font-semibold text-ink-primary shadow-cozy transition-all hover:bg-canvas disabled:opacity-50"
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
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-sans text-xs font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                        >
                          Cancel booking
                        </button>
                      </div>
                    </div>
                    <aside className="rounded-2xl border border-dashed border-pink-300 bg-white/85 p-5 text-center flex flex-col items-center justify-center shadow-cozy">
                      {canShowTicket(booking) ? (
                        <QrTicket booking={booking} />
                      ) : (
                        <p className="font-sans text-xs font-semibold leading-6 text-ink-secondary">
                          {booking.status === "paid" ? "Payment is not backed by a provider verification record. No ticket QR is available." : "Booking confirmation is still pending. A ticket QR will appear after the server confirms the demo booking."}
                        </p>
                      )}
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
    <div className="rounded-xl border border-canvas-muted bg-canvas/30 p-4">
      <dt className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
        {label}
      </dt>
      <dd
        className={`mt-1 font-sans text-base leading-6 ${highlight ? "font-bold text-brand" : "font-semibold text-ink-primary"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

export default Bookings;
