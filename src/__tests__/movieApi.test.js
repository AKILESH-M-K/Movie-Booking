import { apiClient } from "../api/apiClient";
import movies from "../data/movies";
import { fetchMovies } from "../api/movieApi";

jest.mock("../api/apiClient", () => ({
  API_ENABLED: true,
  apiClient: { get: jest.fn() },
}));

beforeEach(() => {
  apiClient.get.mockReset();
});

test("keeps bundled movies and adds movies returned by the backend", async () => {
  apiClient.get.mockResolvedValue({
    data: [
      { id: 102, title: "API Inception", language: "English" },
      { id: 999, title: "Backend Exclusive", language: "English" },
    ],
  });

  const catalog = await fetchMovies();

  expect(catalog).toHaveLength(movies.length + 1);
  expect(catalog.find((movie) => movie.id === 102).title).toBe("API Inception");
  expect(catalog.find((movie) => movie.id === 999).title).toBe("Backend Exclusive");
  expect(catalog.some((movie) => movie.title === "The Matrix")).toBe(true);
  expect(catalog.some((movie) => movie.title === "RRR")).toBe(true);
});
