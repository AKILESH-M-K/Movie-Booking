import { fireEvent, render, screen } from "@testing-library/react";
import MovieCard from "../components/MovieCard";

const movie = {
  id: 101,
  title: "Interstellar",
  genre: "Sci-Fi",
  rating: 4.8,
  duration: "2h 49m",
  price: 250,
  language: "English",
  image: "/interstellar.jpg",
};

test("shows movie details and ticket price", () => {
  render(<MovieCard movie={movie} onSelect={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Interstellar" })).toBeInTheDocument();
  expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  expect(screen.getByText("From ₹250")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Interstellar" })).toHaveAttribute("src", "/interstellar.jpg");
});

test("calls onSelect when View Movie is clicked", () => {
  const onSelect = jest.fn();
  render(<MovieCard movie={movie} onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button", { name: "View Movie" }));
  expect(onSelect).toHaveBeenCalledWith(movie);
});
