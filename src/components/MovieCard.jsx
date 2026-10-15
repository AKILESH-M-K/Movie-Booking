function MovieCard({ movie, onSelect }) {
  return (
    <article className="group overflow-hidden bg-surface rounded-2xl shadow-cozy border border-canvas-muted transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col justify-between">
      {/* Poster with prominent ring boundary and warm shadow */}
      <div className="p-4 pb-0">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-ink-primary/10 shadow-poster bg-canvas-muted">
          <img
            src={movie.image}
            alt={movie.title}
            width="480"
            height="720"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent opacity-90" />

          {/* Star rating tag */}
          <span className="absolute left-3.5 top-3.5 rounded-full border border-canvas-muted/80 bg-surface/95 px-3 py-1.5 font-sans text-xs font-bold text-amber shadow-sm backdrop-blur-sm">
            ⭐ {movie.rating}
          </span>

          {/* Genre tag */}
          <span className="absolute right-3.5 top-3.5 rounded-full bg-brand/90 px-3 py-1.5 font-sans text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            {movie.genre}
          </span>
        </div>
      </div>

      {/* Content details */}
      <div className="p-6 pt-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="line-clamp-2 font-serif text-2xl lg:text-[1.65rem] font-bold tracking-tight text-ink-primary leading-tight">
            {movie.title}
          </h3>
          <p className="mt-2.5 font-sans text-sm font-medium leading-6 text-ink-secondary">
            {movie.language} · {movie.duration}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-canvas-muted/60">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
              Ticket price
            </p>
            <span className="font-sans text-xl font-bold text-brand">
              From ₹{movie.price}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl shadow-cozy transition-all active:scale-[0.99] px-6 py-3.5 text-sm font-sans"
          >
            View Movie
          </button>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
