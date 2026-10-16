import { fetchShows } from "../api/movieApi";
import { useEffect, useMemo, useState } from "react";
import useBooking from "../hooks/useBooking";
import { fetchAvailability } from "../api/bookingApi";
import { API_ENABLED } from "../api/apiClient";
import { isShowAvailable } from "../utils/availability";

const TOTAL_SEATS = 60;
function localDateString(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function ShowTiming({ onContinue, onBack }) {
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedDate,
    selectShow,
    selectDate,
  } = useBooking();
  const [shows, setShows] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarBase] = useState(() => new Date());

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const allShows = await fetchShows();
        const scheduledShows = allShows.filter(
          (show) => show.theatreId == null || String(show.theatreId) === String(selectedTheatre?.id),
        );
        let currentAvailability = {};
        if (API_ENABLED && selectedMovie && selectedTheatre) {
          const entries = await Promise.all(
            scheduledShows.map(async (show) => {
              const result = await fetchAvailability({
                movieId: selectedMovie.id,
                theatre: selectedTheatre.name,
                show: show.time,
                date: selectedDate,
              });
              return [String(show.id), result];
            }),
          );
          currentAvailability = Object.fromEntries(entries);
        }
        if (!ignore) {
          setShows(scheduledShows);
          setAvailability(currentAvailability);
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || err.message || "Unable to load show availability.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [selectedMovie, selectedTheatre, selectedDate]);

  const availableShows = useMemo(
    () => shows.filter((show) => {
      const current = availability[String(show.id)];
      if (API_ENABLED) {
        if (!current) return false;
        return new Set([...(current.bookedSeats || []), ...(current.heldSeats || [])]).size < TOTAL_SEATS;
      }
      return isShowAvailable(selectedMovie, selectedTheatre, show);
    }),
    [shows, availability, selectedMovie, selectedTheatre],
  );

  const isAvailable = (show) => {
    if (API_ENABLED) {
      const current = availability[String(show.id)];
      if (!current) return false;
      return new Set([...(current.bookedSeats || []), ...(current.heldSeats || [])]).size < TOTAL_SEATS;
    }
    return isShowAvailable(selectedMovie, selectedTheatre, show);
  };

  const handleContinue = () => {
    if (!selectedShow) {
      setError("Please select an available show timing first.");
      return;
    }
    if (!isAvailable(selectedShow)) {
      setError("This show is no longer available. Please choose another show.");
      selectShow(null);
      return;
    }
    onContinue();
  };

  const today = localDateString(calendarBase);
  const maxDate = localDateString(new Date(calendarBase.getTime() + 30 * 24 * 60 * 60 * 1000));

  return (
    <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-1.5 text-base font-medium text-ink-secondary hover:text-brand transition">← Back to Theatre</button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary">Step 3 of 6 · {selectedTheatre?.name || "Theatre"}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">Select Show Timing</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-secondary">Choose a date. Show availability is refreshed from the booking server.</p>

        <div className="mt-6 max-w-xs">
          <label htmlFor="show-date" className="mb-2 block text-sm font-semibold">Show date</label>
          <input id="show-date" type="date" min={today} max={maxDate} value={selectedDate || today} onChange={(event) => selectDate(event.target.value)} className="w-full rounded-xl border border-canvas-muted bg-surface px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
        </div>

        {loading ? (
          <p className="mt-8 rounded-2xl border border-canvas-muted bg-surface p-8 text-center font-medium text-ink-secondary shadow-cozy">Loading show availability…</p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-brand/20 bg-brand-light p-5 text-brand"><p className="font-bold">{error}</p><button type="button" className="mt-3 underline" onClick={() => selectDate(selectedDate)}>Retry availability</button></div>
        ) : !shows.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-10 text-center shadow-cozy"><h2 className="font-serif text-xl font-bold">No shows scheduled at this theatre</h2><p className="mt-2 text-base leading-7 text-ink-secondary">Choose another theatre or contact the cinema for its schedule.</p></div>
        ) : !availableShows.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-10 text-center shadow-cozy"><h2 className="font-serif text-xl font-bold">No seats available for this date</h2><p className="mt-2 text-base leading-7 text-ink-secondary">Try another date or theatre.</p></div>
        ) : (
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shows.map((show) => {
              const current = availability[String(show.id)];
              const available = isAvailable(show);
              const active = selectedShow?.id === show.id;
              const occupied = current ? new Set([...(current.bookedSeats || []), ...(current.heldSeats || [])]).size : null;
              return (
                <button key={show.id} type="button" disabled={!available} onClick={() => available && selectShow(show)} className={`rounded-2xl border p-5 text-left transition-all ${!available ? "cursor-not-allowed border-canvas-muted/60 bg-canvas-muted/40 opacity-60" : active ? "border-brand bg-brand-light/30 shadow-cozy ring-2 ring-brand/30" : "border-canvas-muted bg-surface shadow-cozy hover:-translate-y-1 hover:border-brand/40 hover:bg-white"}`}>
                  <div className="flex items-center justify-between gap-3"><p className="text-2xl font-bold">{show.time}</p><span className="rounded-full border border-canvas-muted bg-surface px-2.5 py-1 text-xs font-bold">{available ? "Open" : "Full"}</span></div>
                  <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-canvas-muted bg-canvas/40 px-3 py-1 text-xs font-semibold text-ink-secondary">{show.format}</span><span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">{show.language}</span></div>
                  <p className="mt-4 text-xs font-medium text-ink-secondary">{occupied == null ? "Availability checked locally" : `${TOTAL_SEATS - occupied} of ${TOTAL_SEATS} seats available`}</p>
                  <p className={`mt-3 text-xs font-bold uppercase tracking-wider ${active ? "text-brand" : "text-ink-secondary"}`}>{active ? "✓ Selected" : available ? "Select show →" : "No availability"}</p>
                </button>
              );
            })}
          </div>
        )}
        <button type="button" onClick={handleContinue} disabled={loading || !!error || !availableShows.length || !selectedShow} className="mt-8 w-full rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-cozy transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">Continue to Seat Selection →</button>
      </div>
    </main>
  );
}

export default ShowTiming;
