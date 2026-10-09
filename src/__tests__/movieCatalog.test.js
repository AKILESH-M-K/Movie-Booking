import { existsSync } from "node:fs";
import path from "node:path";
import movies from "../data/movies";

test("contains the expanded film catalog with unique movie IDs", () => {
  const ids = movies.map((movie) => movie.id);
  const newTitles = ["The Matrix", "Barbie", "Coco", "The Batman", "La La Land", "RRR"];

  expect(movies.length).toBeGreaterThan(20);
  expect(new Set(ids).size).toBe(ids.length);
  newTitles.forEach((title) => {
    expect(movies.some((movie) => movie.title === title)).toBe(true);
  });

  movies.filter((movie) => newTitles.includes(movie.title)).forEach((movie) => {
    const localPoster = movie.image.replace("/Movie-Booking/", "");
    expect(existsSync(path.join(process.cwd(), "public", localPoster))).toBe(true);
  });
});
