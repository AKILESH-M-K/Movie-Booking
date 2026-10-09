function MovieCard({ movie, onSelect }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e4e7ec] bg-[#ffffff] shadow-[0_8px_24px_rgba(20,33,61,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#f08a70] hover:shadow-[0_16px_32px_rgba(20,33,61,0.13)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#eef2f7]">
        <img
          src={movie.image}
          alt={movie.title}
          width="360"
          height="480"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent opacity-80" />

        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/40 bg-[#ffffff]/95 px-2.5 py-1 text-xs font-black text-[#344054] shadow-md">
          ⭐ {movie.rating}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-[#2a9d8f]/95 px-2.5 py-1 text-xs font-bold text-white shadow-md">
          {movie.genre}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-xl font-black uppercase text-[#14213d]">
          {movie.title}
        </h3>
        <p className="mt-1.5 text-sm font-medium leading-5 text-[#667085]">
          {movie.language} · {movie.duration}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#98a2b3]">
              Ticket price
            </p>
            <span className="text-base font-black text-[#e4572e]">
              From ₹{movie.price}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="rounded-lg bg-[#e4572e] px-3 py-2.5 text-xs font-black text-white transition-all duration-200 hover:-translate-y-1 hover:bg-[#c94423] hover:shadow-lg hover:shadow-[#e4572e]/20 active:translate-y-0"
          >
            View Movie
          </button>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
