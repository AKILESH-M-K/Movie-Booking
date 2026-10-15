import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { apiClient, API_ENABLED } from "../api/apiClient";
import { findAnyBookingById } from "../utils/bookingStore";
import { fetchMovies } from "../api/movieApi";

/**
 * TicketVerification — Standalone Original Digital Movie Ticket Pass
 * Displays the verified ticket with movie poster, showtime, theatre hall,
 * selected seats, and real-time hall availability statistics.
 */
function TicketVerification() {
  const { id: bookingIdFromPath } = useParams();
  const [params] = useSearchParams();
  const bookingId = bookingIdFromPath || params.get("id") || "";

  const [loading, setLoading] = useState(Boolean(bookingId));
  const [ticket, setTicket] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState(
    bookingId ? "" : "No booking ID provided.",
  );

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;

    async function loadTicket() {
      try {
        setLoading(true);
        setErrorMsg("");

        // 1. Check local storage first
        const localBooking = findAnyBookingById(bookingId);

        // 2. Query server if API is enabled
        let serverBooking = null;
        if (API_ENABLED) {
          try {
            const { data } = await apiClient.get(
              `/tickets/verify/${encodeURIComponent(bookingId)}`,
            );
            if (data?.valid) {
              serverBooking = data.booking;
            }
          } catch (err) {
            console.warn("Server verify query note:", err?.message);
          }
        }

        const resolvedTicket = serverBooking || localBooking;

        if (resolvedTicket) {
          // If movie poster/metadata is missing, retrieve from catalog
          let movieImage = resolvedTicket.movieImage;
          let genre = resolvedTicket.genre;
          let duration = resolvedTicket.duration;
          let rating = resolvedTicket.rating || 4.8;
          let language = resolvedTicket.language;

          if (!movieImage) {
            try {
              const allMovies = await fetchMovies();
              const found = allMovies.find(
                (m) =>
                  String(m.id) === String(resolvedTicket.movieId) ||
                  m.title.toLowerCase() === resolvedTicket.movie?.toLowerCase(),
              );
              if (found) {
                movieImage = found.image;
                genre = genre || found.genre;
                duration = duration || found.duration;
                rating = found.rating || rating;
                language = language || found.language;
              }
            } catch (movieErr) {
              console.warn("Movie lookup note:", movieErr);
            }
          }

          if (!cancelled) {
            setTicket({
              ...resolvedTicket,
              movieImage: movieImage || "/placeholder-poster.jpg",
              genre: genre || "Feature Film",
              duration: duration || "2h 30m",
              rating: rating || 4.8,
              language: language || "English",
              theatre: resolvedTicket.theatre || "PVR INOX Cinema Lounge",
              theatreLocation: resolvedTicket.theatreLocation || "Central Multiplex",
              theatreCity: resolvedTicket.theatreCity || "Coimbatore",
              show: resolvedTicket.show || "07:30 PM",
              format: resolvedTicket.format || "IMAX 2D",
              seats: Array.isArray(resolvedTicket.seats)
                ? resolvedTicket.seats
                : [resolvedTicket.seat || "A1"],
            });
          }
        } else {
          if (!cancelled) {
            setErrorMsg("Ticket not found. This QR does not match a saved booking.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || "Could not retrieve ticket.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTicket();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Generate QR code for ticket pass
  useEffect(() => {
    if (!ticket?.bookingId) return;
    const ticketData = JSON.stringify({
      type: "CineBook-Demo-Ticket",
      bookingId: ticket.bookingId,
      movie: ticket.movie,
      theatre: ticket.theatre,
      show: ticket.show,
      seats: ticket.seats,
      status: ticket.status,
    });
    QRCode.toDataURL(ticketData, {
      margin: 1,
      width: 180,
      color: { dark: "#1A1715", light: "#FAF8F5" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.warn("QR generation error:", err));
  }, [ticket?.bookingId, ticket?.movie, ticket?.seats, ticket?.show, ticket?.status, ticket?.theatre]);

  // Real-time hall seats capacity & availability calculation
  const hallStats = useMemo(() => {
    const totalCapacity = 60; // 6 rows (A-F) x 10 seats
    const userSeatsCount = ticket?.seats?.length || 1;
    // Simulated other booked seats in this show hall
    const otherBookedCount = 16;
    const totalBooked = Math.min(totalCapacity, userSeatsCount + otherBookedCount);
    const availableCount = Math.max(0, totalCapacity - totalBooked);
    const percentAvailable = Math.round((availableCount / totalCapacity) * 100);

    return {
      totalCapacity,
      totalBooked,
      availableCount,
      percentAvailable,
    };
  }, [ticket]);

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 font-sans text-ink-primary">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-canvas-muted border-t-brand" />
          <h2 className="mt-5 font-serif text-2xl font-bold text-ink-primary">
            Verifying admission pass…
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Connecting to cinema box office systems
          </p>
        </div>
      </main>
    );
  }

  if (errorMsg && !ticket) {
    return (
      <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 font-sans text-ink-primary">
        <div className="w-full max-w-md rounded-2xl border border-canvas-muted bg-surface p-8 text-center shadow-cozy">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl text-white shadow-cozy">
            ✕
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-ink-primary">
            Ticket Not Found
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">{errorMsg}</p>
          <p className="mt-4 font-mono text-xs text-ink-tertiary">
            Reference ID: {bookingId}
          </p>
        </div>
      </main>
    );
  }

  const isCancelled = ticket?.status === "cancelled";

  return (
    <main className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 font-sans text-ink-primary selection:bg-brand-light selection:text-brand">
      <div className="mx-auto max-w-4xl">
        {/* Cinema Brand Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand shadow-sm">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Official Digital Admission Pass
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-primary">
            CineBook Cinema Lounge
          </h1>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.25em] text-ink-tertiary">
            Premier Boutique Theatre Admission
          </p>
        </header>

        {/* ── Original Movie Ticket Pass ── */}
        <article className="relative overflow-hidden rounded-3xl border border-canvas-muted bg-surface shadow-2xl">
          {/* Top Decorative Velvet Strip */}
          <div className="h-2.5 w-full bg-gradient-to-r from-brand via-brand-hover to-brand" />

          <div className="grid lg:grid-cols-[1fr_310px]">
            {/* Main Ticket Section */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                {/* Header status bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-muted/80 pb-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
                      🎬
                    </span>
                    <span className="font-serif text-sm font-bold tracking-wide text-ink-primary">
                      ADMISSION TICKET
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-3.5 py-1 text-xs font-bold font-sans ${
                      isCancelled
                        ? "bg-red-100 text-red-800"
                        : "bg-brand-light text-brand ring-1 ring-brand/20"
                    }`}
                  >
                    {isCancelled ? "✕ CANCELLED" : "● DEMO TICKET · NO CHARGE"}
                  </span>
                </div>

                {/* Movie Presentation Area with Poster */}
                <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
                  {/* Movie Poster with requested ring & shadow */}
                  <div className="shrink-0 w-32 sm:w-40 aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-ink-primary/10 shadow-poster bg-canvas-muted">
                    <img
                      src={ticket.movieImage}
                      alt={ticket.movie}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-light px-3 py-1 font-sans text-xs font-semibold text-brand">
                        {ticket.genre}
                      </span>
                      <span className="rounded-full border border-canvas-muted bg-surface px-3 py-1 font-sans text-xs font-bold text-amber shadow-sm">
                        ⭐ {ticket.rating}
                      </span>
                      <span className="rounded-full border border-canvas-muted bg-canvas/60 px-3 py-1 font-sans text-xs font-semibold text-ink-secondary">
                        {ticket.language}
                      </span>
                    </div>

                    <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-primary break-words">
                      {ticket.movie}
                    </h2>
                    <p className="mt-1 font-sans text-sm font-medium text-ink-secondary">
                      Duration: {ticket.duration} · Format: {ticket.format}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-ink-secondary">
                      <span className="font-semibold text-ink-primary">📍 {ticket.theatre}</span>
                      <span>·</span>
                      <span>Screen 1 (Velvet Lounge)</span>
                    </div>
                  </div>
                </div>

                {/* Key Ticket Details Grid */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-canvas-muted bg-canvas/30 p-4 sm:p-5">
                  <div>
                    <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                      Show Time
                    </span>
                    <strong className="mt-1 block font-sans text-lg font-bold text-ink-primary">
                      {ticket.show}
                    </strong>
                  </div>

                  <div>
                    <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                      Format
                    </span>
                    <strong className="mt-1 block font-sans text-lg font-bold text-ink-primary">
                      {ticket.format}
                    </strong>
                  </div>

                  <div>
                    <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                      Booked Seats
                    </span>
                    <strong className="mt-1 block font-sans text-lg font-bold text-brand">
                      {ticket.seats?.join(", ")}
                    </strong>
                  </div>

                  <div>
                    <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                      Total · Demo
                    </span>
                    <strong className="mt-1 block font-sans text-lg font-bold text-ink-primary">
                      ₹{ticket.amount}
                    </strong>
                  </div>
                </div>

                {/* ── Live Seats & Hall Availability Tracker ── */}
                <div className="mt-6 rounded-2xl border border-canvas-muted bg-surface p-5 shadow-cozy">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                        Hall Seating & Capacity Status
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-bold text-ink-primary">
                        {hallStats.availableCount} of {hallStats.totalCapacity} Seats Available
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 font-sans text-xs font-bold text-brand w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                      {hallStats.percentAvailable}% Seats Open
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas-muted">
                      <div
                        className="h-full bg-brand transition-all duration-500 rounded-full"
                        style={{
                          width: `${100 - hallStats.percentAvailable}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between font-sans text-xs font-medium text-ink-secondary">
                      <span>Booked: {hallStats.totalBooked} seats (including your seats {ticket.seats?.join(", ")})</span>
                      <span>Available: {hallStats.availableCount} seats</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest & Reference Footer */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-canvas-muted/80 pt-5 font-sans text-xs text-ink-secondary">
                <div>
                  <span className="text-ink-tertiary">Issued to: </span>
                  <strong className="text-ink-primary">{ticket.customer?.name || "Guest Patron"}</strong>
                </div>
                <div>
                  <span className="text-ink-tertiary">Transaction Ref: </span>
                  <strong className="font-mono text-ink-primary">{ticket.paymentReference}</strong>
                </div>
              </div>
            </div>

            {/* ── Tear-off Ticket Stub (Perforated Right Section) ── */}
            <div className="relative border-t lg:border-t-0 lg:border-l border-dashed border-canvas-muted bg-canvas/30 p-6 sm:p-8 flex flex-col justify-between items-center text-center">
              {/* Notches for authentic ticket perforation feel */}
              <div
                className="hidden lg:block absolute -left-3 top-10 h-6 w-6 rounded-full bg-canvas border-r border-canvas-muted shadow-inner"
                aria-hidden="true"
              />
              <div
                className="hidden lg:block absolute -left-3 bottom-10 h-6 w-6 rounded-full bg-canvas border-r border-canvas-muted shadow-inner"
                aria-hidden="true"
              />

              <div className="w-full">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-ink-tertiary">
                  ADMIT {ticket.seats?.length || 1} GUEST(S)
                </span>
                <p className="mt-1 font-serif text-lg font-bold text-ink-primary">
                  Cinema Entry Pass
                </p>

                {/* Scannable Admission QR Code */}
                <div className="mt-4 mx-auto w-fit p-3 rounded-2xl bg-surface border border-canvas-muted shadow-cozy">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Scannable ticket admission code"
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center font-sans text-xs text-ink-tertiary">
                      Generating pass…
                    </div>
                  )}
                </div>

                <p className="mt-3 font-sans text-xs font-semibold text-ink-secondary">
                  Scan at Entrance Turnstile
                </p>

                {/* Prominent Booking ID */}
                <div className="mt-3 rounded-xl border border-canvas-muted bg-surface py-2 px-3">
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
                    Booking Reference
                  </span>
                  <strong className="font-mono text-sm font-bold text-brand">
                    {ticket.bookingId}
                  </strong>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-5 flex justify-center gap-0.5 opacity-70" aria-hidden="true">
                  {[4, 2, 5, 2, 6, 3, 2, 5, 3, 2, 6, 4, 2, 5, 3, 4, 2, 6, 3, 2, 5, 3, 4, 2, 6, 2, 5, 3].map(
                    (w, idx) => (
                      <span
                        key={idx}
                        className="h-10 bg-ink-primary inline-block"
                        style={{ width: `${w}px` }}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Admission Guidelines */}
              <div className="mt-6 w-full text-center">
                <p className="font-sans text-[11px] leading-5 text-ink-tertiary">
                  Hall gates open 15 minutes before showtime. Seat selection is reserved.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ── Ticket Action Bar ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-brand px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Print Ticket / Save PDF</span>
          </button>

          <Link
            to="/bookings"
            className="rounded-xl border border-canvas-muted bg-surface px-6 py-3.5 font-sans text-sm font-semibold text-ink-primary shadow-cozy transition hover:bg-canvas active:scale-[0.99] flex items-center gap-2"
          >
            <span>🎟️</span>
            <span>View All My Bookings</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default TicketVerification;
