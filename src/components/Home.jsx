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
    <main id="home" className="bg-[#f9f4e4]">
      <section className="relative overflow-hidden border-b border-[#eae3cc] bg-[#f2ebd8]">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#c9803d]/10 blur-3xl" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#6d7650]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 text-center lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ce9d68]/40 bg-[#fffcf5]/70 px-4 py-2 text-sm font-bold tracking-wide text-[#9b5d28] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#c9803d]" />
            MOVIE TICKETS, MADE SIMPLE
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-[#3d3324] sm:text-6xl lg:text-7xl">
            Your next movie night
            <span className="block text-[#b16b2b]">starts here.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#6a604d] sm:text-lg">
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
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a7547]">
              Browse collection
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#3d3324] sm:text-4xl">
              Now Showing
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#736956]">
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
                    ? "border-[#a4652a] bg-[#a4652a] text-white shadow-md shadow-[#a4652a]/20"
                    : "border-[#e4dac2] bg-[#fffcf5] text-[#6f6550] hover:border-[#c9803d] hover:bg-[#fdf6e5] hover:text-[#915826]"
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
