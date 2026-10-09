import useMovies from "../hooks/useMovies";
import SearchBar from "./SearchBar";
import MovieList from "./MovieList";

function Home({ onSelectMovie }) {
  const {
    movies,
    loading,
    error,
    genres,
    searchTerm,
    selectedGenre,
    searchInputRef,
    searchMovies,
    filterByGenre,
    chooseMovie,
  } = useMovies();

  const handleMovieSelect = (movie) => {
    chooseMovie(movie);
    onSelectMovie(movie);
  };

  return (
    <main id="home" className="bg-[#f6f8fb]">
      <section className="relative overflow-hidden border-b border-[#e4e7ec] bg-[#eef2f7]">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#e4572e]/10 blur-3xl" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#2a9d8f]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 text-center lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f08a70]/40 bg-[#ffffff]/70 px-4 py-2 text-sm font-bold tracking-wide text-[#9b5d28] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#e4572e]" />
            MOVIE TICKETS, MADE SIMPLE
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black uppercase tracking-tight text-[#14213d] sm:text-6xl lg:text-7xl">
            Your next movie night
            <span className="font-script mt-1 block text-6xl font-normal normal-case tracking-normal text-[#e4572e] sm:text-7xl lg:text-8xl">
              starts here.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#667085] sm:text-lg">
            Discover movies, explore theatres, choose your seats, and complete
            your booking in a simple and comfortable flow.
          </p>

          <div className="mx-auto mt-9 max-w-3xl">
            <SearchBar
              value={searchTerm}
              onChange={searchMovies}
              inputRef={searchInputRef}
            />
          </div>
        </div>
      </section>

      <section
        id="movies"
        className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#667085]">
              Browse collection
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#14213d] sm:text-4xl">
              Now Showing
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#667085]">
              Search by title, language, genre, or cast and choose a movie to
              begin booking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => filterByGenre(genre)}
                className={`rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                  selectedGenre === genre
                    ? "border-[#e4572e] bg-[#e4572e] text-white shadow-md shadow-[#e4572e]/20"
                    : "border-[#e4e7ec] bg-[#ffffff] text-[#6f6550] hover:border-[#e4572e] hover:bg-[#fff7f4] hover:text-[#c94423]"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <MovieList
            movies={movies}
            onSelectMovie={handleMovieSelect}
            loading={loading}
            error={error}
          />
        </div>
      </section>
    </main>
  );
}

export default Home;
