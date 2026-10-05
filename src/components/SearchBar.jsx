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
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#9f8c6d]">⌕</span>
      <input
        ref={inputRef}
        id={searchId}
        type="search"
        value={value}
        onChange={(e) => onChange(sanitizeSearch(e.target.value))}
        placeholder="Search movies, genres, languages or cast..."
        className="w-full rounded-2xl border border-[#e3d8c0] bg-[#fffef7] px-12 py-4 text-base text-[#3d3324] shadow-[0_10px_30px_rgba(94,67,45,0.08)] outline-none transition-all duration-200 placeholder:text-[#a99f8a] focus:border-[#c9803d] focus:ring-4 focus:ring-[#c9803d]/10"
      />
    </div>
  );
}

export default SearchBar;
