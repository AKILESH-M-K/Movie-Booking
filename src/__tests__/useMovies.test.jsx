import { act, renderHook, waitFor } from "@testing-library/react";
import useMovies from "../hooks/useMovies";
import { fetchMovies } from "../api/movieApi";
import useBooking from "../hooks/useBooking";

jest.mock("../api/movieApi", () => ({ fetchMovies: jest.fn() }));
jest.mock("../hooks/useBooking", () => ({ __esModule: true, default: jest.fn() }));

const movies = [
  { id: 1, title: "Interstellar", genre: "Sci-Fi", cast: "Matthew McConaughey", language: "English" },
  { id: 2, title: "Leo", genre: "Action", cast: "Vijay", language: "Tamil" },
  { id: 3, title: "Inception", genre: "Sci-Fi", cast: "Leonardo DiCaprio", language: "English" },
];

beforeEach(() => {
  fetchMovies.mockResolvedValue(movies);
  useBooking.mockReturnValue({ selectMovie: jest.fn() });
});

test("searches movies by title and filters by genre", async () => {
  const { result } = renderHook(() => useMovies());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.movies).toHaveLength(3);

  act(() => result.current.searchMovies("interstellar"));
  expect(result.current.movies.map((movie) => movie.title)).toEqual(["Interstellar"]);

  act(() => {
    result.current.searchMovies("");
    result.current.filterByGenre("Sci-Fi");
  });
  expect(result.current.movies.map((movie) => movie.title)).toEqual(["Interstellar", "Inception"]);
});

test.each([
  ["cast member", "vijay", "Leo"],
  ["language", "tamil", "Leo"],
  ["genre", "action", "Leo"],
])("searches by %s metadata", async (_label, term, expectedTitle) => {
  const { result } = renderHook(() => useMovies());
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.searchMovies(term));
  expect(result.current.movies.map((movie) => movie.title)).toEqual([expectedTitle]);
});

test("shows an error when movie loading fails", async () => {
  fetchMovies.mockRejectedValueOnce(new Error("Network failed"));
  const { result } = renderHook(() => useMovies());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe("Network failed");
});
