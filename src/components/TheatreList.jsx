import { useEffect, useState } from "react";
import useBooking from "../hooks/useBooking";
import { isTheatreAvailable } from "../utils/availability";
import { fetchTheatres } from "../api/movieApi";

function TheatreList({ onContinue, onBack }) {
  const { selectedMovie, selectedTheatre, selectTheatre } = useBooking();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch theatre information from the REST API.
  useEffect(() => {
    async function loadTheatres() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTheatres();
        setTheatres(data);
      } catch (err) {
        setError(err.message || "Failed to load theatres");
      } finally {
        setLoading(false);
      }
    }

    loadTheatres();
  }, []);

  const availableTheatres = theatres.filter((theatre) =>
    isTheatreAvailable(selectedMovie, theatre),
  );

  const handleContinue = () => {
    if (!selectedTheatre) {
      alert("Please select an available theatre first.");
      return;
    }

    if (!isTheatreAvailable(selectedMovie, selectedTheatre)) {
      alert("This theatre is no longer available for the selected movie. Please choose another theatre.");
      selectTheatre(null);
      return;
    }

    onContinue();
  };

  return (
    <main className="min-h-[calc(100vh-76px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-7 inline-flex items-center gap-1.5 text-base font-medium font-sans text-ink-secondary hover:text-brand transition"
        >
          ← Back to Movie
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary font-sans">
              Step 2 of 6 · Live-style availability
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
              Choose a Theatre
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-secondary font-sans sm:text-lg">
              Availability is generated for your selected movie and stays consistent while you complete this booking.
            </p>
          </div>
          <div className="rounded-2xl border border-canvas-muted bg-surface px-4 py-2.5 font-sans text-sm font-semibold text-ink-secondary shadow-cozy">
            📍 Coimbatore · {availableTheatres.length} available
          </div>
        </div>

        {loading ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-12 text-center shadow-cozy">
            <div className="text-4xl">⏳</div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-ink-primary">Loading theatres…</h2>
          </div>
        ) : error ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-12 text-center shadow-cozy">
            <div className="text-4xl">⚠️</div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-ink-primary">Something went wrong</h2>
            <p className="mx-auto mt-2 max-w-xl font-sans text-base leading-7 text-ink-secondary">{error}</p>
          </div>
        ) : !availableTheatres.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-canvas-muted bg-surface p-12 text-center shadow-cozy">
            <div className="text-4xl">🏢</div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-ink-primary">No theatres available</h2>
            <p className="mx-auto mt-2 max-w-xl font-sans text-base leading-7 text-ink-secondary">
              There are currently no available theatres for this movie. Go back and choose another movie.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {theatres.map((theatre) => {
              const available = isTheatreAvailable(selectedMovie, theatre);
              const active = selectedTheatre?.id === theatre.id;

              return (
                <button
                  key={theatre.id}
                  type="button"
                  disabled={!available}
                  onClick={() => available && selectTheatre(theatre)}
                  className={`group rounded-2xl border p-6 text-left transition-all duration-300 ${
                    !available
                      ? "cursor-not-allowed border-canvas-muted/60 bg-canvas-muted/40 opacity-60"
                      : active
                        ? "border-brand bg-brand-light/20 shadow-cozy ring-2 ring-brand/30"
                        : "border-canvas-muted bg-surface shadow-cozy hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canvas text-2xl border border-canvas-muted shadow-sm">
                      🎬
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-sans text-xs font-bold ${
                        available ? "bg-surface border border-canvas-muted text-ink-primary shadow-sm" : "bg-canvas-muted text-ink-tertiary"
                      }`}
                    >
                      {available ? "● Available" : "× Sold out"}
                    </span>
                  </div>

                  <h2 className="mt-5 font-serif text-xl font-bold text-ink-primary">{theatre.name}</h2>
                  <p className="mt-2 font-sans text-sm font-medium text-ink-secondary">{theatre.location}, {theatre.city}</p>
                  <div className="mt-4 flex flex-wrap gap-2 font-sans">
                    <span className="rounded-full border border-canvas-muted bg-canvas/40 px-3 py-1 text-xs font-semibold text-ink-secondary">
                      {theatre.distance}
                    </span>
                    <span className="rounded-full border border-canvas-muted bg-canvas/40 px-3 py-1 text-xs font-semibold text-ink-secondary">
                      {theatre.screens} screens
                    </span>
                    {theatre.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div
                    className={`mt-6 border-t pt-4 font-sans text-xs font-bold uppercase tracking-wider ${
                      active ? "border-brand/30 text-brand" : "border-canvas-muted text-ink-secondary"
                    }`}
                  >
                    {available ? (active ? "✓ Theatre selected" : "Select theatre →") : "Currently unavailable"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!availableTheatres.length}
          className="mt-8 w-full rounded-xl bg-brand px-6 py-4 font-sans text-base font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          Continue to Show Timing →
        </button>
      </div>
    </main>
  );
}

export default TheatreList;
