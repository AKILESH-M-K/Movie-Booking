function MovieCard({ movie, onSelect }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#eae3cc] bg-[#fffef7] shadow-[0_8px_24px_rgba(82,60,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-[#ce9d68] hover:shadow-[0_20px_42px_rgba(82,60,42,0.16)]">
      <div className="relative aspect-[2/3] overflow-hidden bg-[#eee7d4]">
        <img
          src={movie.image}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent opacity-80" />

        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-[#fffcf5]/95 px-3 py-1.5 text-sm font-black text-[#7c552e] shadow-md">
          ⭐ {movie.rating}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-[#66704d]/95 px-3 py-1.5 text-sm font-bold text-white shadow-md">
          {movie.genre}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="line-clamp-1 text-xl font-black text-[#3d3324]">
          {movie.title}
        </h3>
        <p className="mt-2 text-base font-medium leading-6 text-[#7d705a]">
          {movie.language} · {movie.duration}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#aa9c80]">
              Ticket price
            </p>
            <span className="text-xl font-black text-[#a4652a]">
              From ₹{movie.price}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="rounded-xl bg-[#a4652a] px-4 py-3 text-sm font-black text-white transition-all duration-200 hover:-translate-y-1 hover:bg-[#875022] hover:shadow-lg hover:shadow-[#a4652a]/20 active:translate-y-0"
          >
            View Movie
          </button>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
