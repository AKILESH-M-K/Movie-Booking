import { fireEvent, render, screen } from "@testing-library/react";
import MovieDetail from "../components/MovieDetail";
import useBooking from "../hooks/useBooking";

jest.mock("../hooks/useBooking", () => ({ __esModule: true, default: jest.fn() }));

const movie = {
  id: 101,
  title: "Interstellar",
  genre: "Sci-Fi",
  rating: 4.8,
  duration: "2h 49m",
  price: 250,
  language: "English",
  cast: "Matthew McConaughey",
  description: "A team travels through a wormhole.",
  image: "/interstellar.jpg",
};

beforeEach(() => useBooking.mockReturnValue({ selectedMovie: null }));

test("displays movie information", () => {
  render(<MovieDetail movie={movie} onBack={jest.fn()} onBook={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Interstellar" })).toBeInTheDocument();
  expect(screen.getByText("A team travels through a wormhole.")).toBeInTheDocument();
  expect(screen.getByText("₹250")).toBeInTheDocument();
});

test("runs back and choose-theatre callbacks", () => {
  const onBack = jest.fn();
  const onBook = jest.fn();
  render(<MovieDetail movie={movie} onBack={onBack} onBook={onBook} />);
  fireEvent.click(screen.getByRole("button", { name: /Back to Movies/i }));
  fireEvent.click(screen.getByRole("button", { name: /Choose Theatre/i }));
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(onBook).toHaveBeenCalledTimes(1);
});
