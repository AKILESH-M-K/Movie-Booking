import useBooking from "../hooks/useBooking";

function MovieDetail({ movie: movieProp, onBack, onBook }) {
  const { selectedMovie } = useBooking();
  const movie = movieProp || selectedMovie;

  if (!movie) return null;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-1.5 text-base font-medium font-sans text-ink-secondary transition hover:-translate-x-1 hover:text-brand"
        >
          ← Back to Movies
        </button>

        <div className="grid overflow-hidden rounded-2xl border border-canvas-muted bg-surface shadow-cozy lg:grid-cols-[340px_1fr]">
          <div className="flex items-center justify-center bg-canvas/40 p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-[280px] overflow-hidden rounded-xl shadow-poster ring-1 ring-ink-primary/10 bg-canvas-muted">
              <img
                src={movie.image}
                alt={movie.title}
                className="aspect-[3/4] h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-brand-light px-3.5 py-1.5 text-xs font-semibold text-brand">
                {movie.genre}
              </span>
              <span className="rounded-full border border-canvas-muted bg-surface px-3.5 py-1.5 text-xs font-bold text-amber shadow-sm">
                ⭐ {movie.rating}
              </span>
            </div>

            <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
              {movie.title}
            </h1>
            <p className="mt-4 font-sans text-base leading-8 text-ink-secondary sm:text-lg">
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
              className="mt-9 w-full rounded-xl bg-brand px-7 py-4 text-base font-semibold font-sans text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] sm:w-auto"
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
    <div className="rounded-xl border border-canvas-muted bg-canvas/30 p-4">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
        {label}
      </p>
      <p className="mt-1 font-sans text-base font-semibold leading-6 text-ink-primary">
        {value}
      </p>
    </div>
  );
}

export default MovieDetail;
