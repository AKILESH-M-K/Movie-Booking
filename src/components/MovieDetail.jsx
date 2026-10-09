import useBooking from "../hooks/useBooking";

function MovieDetail({ movie: movieProp, onBack, onBook }) {
  const { selectedMovie } = useBooking();
  const movie = movieProp || selectedMovie;

  if (!movie) return null;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-base font-bold text-[#667085] transition hover:-translate-x-1 hover:text-[#e4572e]"
        >
          ← Back to Movies
        </button>

        <div className="grid overflow-hidden rounded-3xl border border-[#e6dec8] bg-[#ffffff] shadow-[0_18px_45px_rgba(82,60,42,0.12)] lg:grid-cols-[300px_1fr]">
          <div className="min-h-[420px] bg-[#eee5d1] lg:min-h-full">
            <img
              src={movie.image}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f6efda] px-3 py-1.5 text-sm font-bold text-[#876034]">
                {movie.genre}
              </span>
              <span className="rounded-full bg-[#e6f5ef] px-3 py-1.5 text-sm font-bold text-[#147d61]">
                ⭐ {movie.rating}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#14213d] sm:text-5xl">
              {movie.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#6f644e]">
              {movie.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label="Language" value={movie.language} />
              <Info label="Duration" value={movie.duration} />
              <Info label="Cast" value={movie.cast} />
              <Info label="Starting Price" value={`₹${movie.price}`} />
            </div>

            <button
              type="button"
              onClick={onBook}
              className="mt-9 w-full rounded-xl bg-[#e4572e] px-6 py-4 text-base font-black text-white shadow-md shadow-[#e4572e]/15 transition-all duration-200 hover:-translate-y-1 hover:bg-[#c94423] hover:shadow-xl hover:shadow-[#e4572e]/20 active:translate-y-0 sm:w-auto"
            >
              Choose Theatre →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] bg-[#f8fafc] p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-[#98a2b3]">
        {label}
      </p>
      <p className="mt-1 text-base font-bold leading-6 text-[#344054]">
        {value}
      </p>
    </div>
  );
}

export default MovieDetail;
