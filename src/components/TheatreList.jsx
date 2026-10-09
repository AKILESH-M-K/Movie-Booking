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
    <main className="min-h-[calc(100vh-76px)] bg-[#f6f8fb] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <button type="button" onClick={onBack} className="mb-7 text-base font-bold text-[#667085] transition-all hover:-translate-x-1 hover:text-[#e4572e]">
          ← Back to Movie
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">Step 2 of 6 · Live-style availability</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#14213d] sm:text-5xl">Choose a Theatre</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-[#667085]">
              Availability is generated for your selected movie and stays consistent while you complete this booking.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9dfc5] bg-[#ffffff] px-4 py-3 text-sm font-bold text-[#6f624b] shadow-sm">
            📍 Coimbatore · {availableTheatres.length} available
          </div>
        </div>

        {loading ? (
          <div className="mt-9 rounded-3xl border border-dashed border-[#d0d5dd] bg-[#ffffff] p-12 text-center">
            <div className="text-4xl">⏳</div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">Loading theatres…</h2>
          </div>
        ) : error ? (
          <div className="mt-9 rounded-3xl border border-dashed border-[#d0d5dd] bg-[#ffffff] p-12 text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">Something went wrong</h2>
            <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-[#667085]">{error}</p>
          </div>
        ) : !availableTheatres.length ? (
          <div className="mt-9 rounded-3xl border border-dashed border-[#d0d5dd] bg-[#ffffff] p-12 text-center">
            <div className="text-4xl">🏢</div>
            <h2 className="mt-4 text-2xl font-black text-[#483e2d]">No theatres available</h2>
            <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-[#667085]">
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
                  className={`group rounded-3xl border p-6 text-left transition-all duration-300 ${
                    !available
                      ? "cursor-not-allowed border-[#ebe5d6] bg-[#f4f1e9] opacity-65"
                      : active
                        ? "border-[#e4572e] bg-[#fdf1df] shadow-[0_12px_30px_rgba(143,86,56,0.13)]"
                        : "border-[#e4e7ec] bg-[#ffffff] hover:-translate-y-1.5 hover:border-[#f08a70] hover:bg-[#fffcf6] hover:shadow-[0_18px_38px_rgba(82,60,42,0.14)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6eeda] text-2xl">🎬</div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${available ? "bg-[#e8ecdf] text-[#147d61]" : "bg-[#e7e5de] text-[#7c7568]"}`}>
                      {available ? "● Available" : "× Sold out"}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-black text-[#1d3557]">{theatre.name}</h2>
                  <p className="mt-2 text-base font-medium text-[#776d57]">{theatre.location}, {theatre.city}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f9f5e9] px-3 py-1 text-xs font-bold text-[#807355]">{theatre.distance}</span>
                    <span className="rounded-full bg-[#f9f5e9] px-3 py-1 text-xs font-bold text-[#807355]">{theatre.screens} screens</span>
                    {theatre.features.slice(0, 2).map((feature) => (
                      <span key={feature} className="rounded-full bg-[#edf0e5] px-3 py-1 text-xs font-bold text-[#147d61]">{feature}</span>
                    ))}
                  </div>
                  <div className={`mt-6 border-t pt-4 text-sm font-black ${active ? "border-[#e8cfb2] text-[#e4572e]" : "border-[#f2ebd9] text-[#9d8d6f]"}`}>
                    {available ? active ? "✓ Theatre selected" : "Select theatre →" : "Currently unavailable"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button type="button" onClick={handleContinue} disabled={!availableTheatres.length} className="mt-8 w-full rounded-xl bg-[#e4572e] px-6 py-4 text-base font-black text-white shadow-md transition-all hover:-translate-y-1 hover:bg-[#c94423] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto">
          Continue to Show Timing →
        </button>
      </div>
    </main>
  );
}

export default TheatreList;
