import { useEffect, useId } from "react";
import { sanitizeSearch } from "../utils/validation";

function SearchBar({ value, onChange, inputRef }) {
  const searchId = useId();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  return (
    <div className="relative">
      <label htmlFor={searchId} className="sr-only">Search movies</label>
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-ink-tertiary">⌕</span>
      <input
        ref={inputRef}
        id={searchId}
        type="search"
        value={value}
        onChange={(e) => onChange(sanitizeSearch(e.target.value))}
        placeholder="Search movies, genres, languages or cast..."
        className="w-full rounded-2xl border border-canvas-muted bg-surface px-12 py-4 font-sans text-base text-ink-primary shadow-cozy outline-none transition-all duration-200 placeholder:text-ink-tertiary focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </div>
  );
}

export default SearchBar;
