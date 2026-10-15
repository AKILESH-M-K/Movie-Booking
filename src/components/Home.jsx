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
    <main id="home" className="bg-canvas text-ink-primary font-sans">
      <section className="relative overflow-hidden border-b border-canvas-muted bg-surface/60">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-amber/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 text-center lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-light/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-brand shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            BOUTIQUE CINEMA LOUNGE
          </div>

          <h2 className="mx-auto max-w-4xl font-serif text-4xl font-bold uppercase tracking-tight text-ink-primary sm:text-6xl lg:text-7xl">
            Your next movie night
            <span className="font-script mt-1 block text-6xl font-normal normal-case tracking-normal text-brand sm:text-7xl lg:text-8xl">
              starts here.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-8 text-ink-secondary sm:text-lg">
            Discover curated films, reserve premier theatre seats, and immerse yourself in an editorial boutique cinema experience.
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
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary">
              Browse collection
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              Now Showing
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-7 text-ink-secondary">
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
                className={`rounded-full border px-4 py-2 font-sans text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  selectedGenre === genre
                    ? "border-brand bg-brand text-white shadow-cozy"
                    : "border-canvas-muted bg-surface text-ink-secondary hover:border-brand/40 hover:bg-white hover:text-brand"
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
