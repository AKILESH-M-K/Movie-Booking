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
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#667085] transition hover:-translate-x-1 hover:text-[#e4572e]">← Back to Theatre</button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">Step 3 of 6 · {selectedTheatre?.name || "Theatre"}</p>
        <h1 className="mt-2 text-4xl font-black text-[#14213d]">Select Show Timing</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">Show availability is specific to your movie and theatre selection.</p>

        {loading ? (
          <p className="mt-8 rounded-xl bg-[#ffffff] p-8 text-center font-bold text-[#667085]">Loading show information…</p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-bold">{error}</p><button type="button" onClick={loadShows} className="mt-3 underline">Retry</button>
          </div>
        ) : !availableShows.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#ffffff] p-10 text-center">
            <h2 className="text-xl font-black text-[#483e2d]">No shows available</h2>
            <p className="mt-2 text-base leading-7 text-[#667085]">Please go back and choose another theatre.</p>
          </div>
        ) : (
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shows.map((show) => {
              const available = isShowAvailable(selectedMovie, selectedTheatre, show);
              const active = selectedShow?.id === show.id;
              return (
                <button key={show.id} type="button" disabled={!available} onClick={() => available && selectShow(show)} className={`rounded-2xl border p-5 text-left transition-all duration-200 ${!available ? "cursor-not-allowed border-[#ebe5d6] bg-[#f4f1e9] opacity-60" : active ? "border-[#e4572e] bg-[#fcf0e1] shadow-md shadow-[#e4572e]/10" : "border-[#e4e7ec] bg-[#ffffff] hover:-translate-y-1 hover:border-[#f08a70] hover:shadow-lg"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xl font-black text-[#1d3557]">{show.time}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${available ? "bg-[#e8ecdf] text-[#147d61]" : "bg-[#e7e5de] text-[#7c7568]"}`}>{available ? "Open" : "Full"}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-full bg-[#f6efda] px-3 py-1 text-sm font-bold text-[#876034]">{show.format}</span>
                    <span className="rounded-full bg-[#e8ecdf] px-3 py-1 text-sm font-bold text-[#147d61]">{show.language}</span>
                  </div>
                  <p className={`mt-5 text-sm font-black ${available ? active ? "text-[#e4572e]" : "text-[#9d8d6f]" : "text-[#9d8d6f]"}`}>{available ? active ? "✓ Selected" : "Select Show →" : "No availability"}</p>
                </button>
              );
            })}
          </div>
        )}

        <button type="button" onClick={handleContinue} disabled={loading || !!error || !availableShows.length} className="mt-8 w-full rounded-xl bg-[#e4572e] px-6 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#c94423] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">Continue to Seat Selection →</button>
      </div>
    </main>
  );
}

export default ShowTiming;
