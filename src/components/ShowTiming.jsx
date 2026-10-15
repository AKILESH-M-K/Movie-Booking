import { fetchShows } from "../api/movieApi";
import { useEffect, useState } from "react";
import useBooking from "../hooks/useBooking";
import { isShowAvailable } from "../utils/availability";

function ShowTiming({ onContinue, onBack }) {
  const { selectedMovie, selectedTheatre, selectedShow, selectShow } = useBooking();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await fetchShows();
        if (!ignore) {
          setShows(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load show information.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const availableShows = shows.filter((show) => isShowAvailable(selectedMovie, selectedTheatre, show));

  const handleContinue = () => {
    if (!selectedShow) {
      alert("Please select an available show timing first.");
      return;
    }
    if (!isShowAvailable(selectedMovie, selectedTheatre, selectedShow)) {
      alert("This show is no longer available. Please choose another show.");
      selectShow(null);
      return;
    }
    onContinue();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-1.5 text-base font-medium font-sans text-ink-secondary hover:text-brand transition"
        >
          ← Back to Theatre
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary font-sans">
          Step 3 of 6 · {selectedTheatre?.name || "Theatre"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary">
          Select Show Timing
        </h1>
        <p className="mt-3 text-base leading-7 text-ink-secondary font-sans">
          Show availability is specific to your movie and theatre selection.
        </p>

        {loading ? (
          <p className="mt-8 rounded-2xl border border-canvas-muted bg-surface p-8 text-center font-sans font-medium text-ink-secondary shadow-cozy">
            Loading show information…
          </p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-brand/20 bg-brand-light p-5 text-brand">
            <p className="font-bold">{error}</p>
          </div>
        ) : !availableShows.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-10 text-center shadow-cozy">
            <h2 className="font-serif text-xl font-bold text-ink-primary">No shows available</h2>
            <p className="mt-2 font-sans text-base leading-7 text-ink-secondary">
              Please go back and choose another theatre.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shows.map((show) => {
              const available = isShowAvailable(selectedMovie, selectedTheatre, show);
              const active = selectedShow?.id === show.id;
              return (
                <button
                  key={show.id}
                  type="button"
                  disabled={!available}
                  onClick={() => available && selectShow(show)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                    !available
                      ? "cursor-not-allowed border-canvas-muted/60 bg-canvas-muted/40 opacity-60"
                      : active
                        ? "border-brand bg-brand-light/30 shadow-cozy ring-2 ring-brand/30"
                        : "border-canvas-muted bg-surface shadow-cozy hover:-translate-y-1 hover:border-brand/40 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-sans text-2xl font-bold text-ink-primary">{show.time}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold font-sans ${
                        available ? "bg-surface border border-canvas-muted text-ink-primary shadow-sm" : "bg-canvas-muted text-ink-tertiary"
                      }`}
                    >
                      {available ? "Open" : "Full"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2 font-sans">
                    <span className="rounded-full border border-canvas-muted bg-canvas/40 px-3 py-1 text-xs font-semibold text-ink-secondary">
                      {show.format}
                    </span>
                    <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                      {show.language}
                    </span>
                  </div>
                  <p
                    className={`mt-5 font-sans text-xs font-bold uppercase tracking-wider ${
                      available ? (active ? "text-brand" : "text-ink-secondary") : "text-ink-tertiary"
                    }`}
                  >
                    {available ? (active ? "✓ Selected" : "Select Show →") : "No availability"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || !!error || !availableShows.length}
          className="mt-8 w-full rounded-xl bg-brand px-6 py-4 font-sans text-base font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          Continue to Seat Selection →
        </button>
      </div>
    </main>
  );
}

export default ShowTiming;
