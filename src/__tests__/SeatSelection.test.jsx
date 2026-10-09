import { fireEvent, render, screen } from "@testing-library/react";
import SeatSelection from "../components/SeatSelection";
import useBooking from "../hooks/useBooking";
import { getBookedSeats } from "../utils/availability";

jest.mock("../hooks/useBooking", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../utils/availability", () => ({ getBookedSeats: jest.fn() }));

const selectSeat = jest.fn();
const baseBooking = {
  selectedMovie: { id: 101, title: "Interstellar", price: 250 },
  selectedTheatre: { id: 1, name: "PVR INOX" },
  selectedShow: { id: 1, time: "07:30 PM" },
  selectedSeats: [],
  selectedSeatCount: 0,
  selectSeat,
};

beforeEach(() => {
  selectSeat.mockClear();
  getBookedSeats.mockReturnValue(["A2"]);
  useBooking.mockReturnValue(baseBooking);
});

test("selects an available seat and does not allow a booked seat", () => {
  render(<SeatSelection onContinue={jest.fn()} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /^Seat A1,/ }));
  expect(selectSeat).toHaveBeenCalledWith("A1");
  expect(screen.getByRole("button", { name: /Seat A2/ })).toBeDisabled();
});

test("asks the user to select a seat before continuing", () => {
  const onContinue = jest.fn();
  render(<SeatSelection onContinue={onContinue} onBack={jest.fn()} />);
  expect(
    screen.getByRole("button", { name: /Continue to Summary/i }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Continue to Summary/i }));
  expect(onContinue).not.toHaveBeenCalled();
});

test("calls seat toggle when a previously selected seat is clicked", () => {
  useBooking.mockReturnValue({
    ...baseBooking,
    selectedSeats: ["A1"],
    selectedSeatCount: 1,
  });

  render(<SeatSelection onContinue={jest.fn()} onBack={jest.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: /^Seat A1,/ }));

  expect(selectSeat).toHaveBeenCalledWith("A1");
});


test("supports arrow-key movement between available seats", () => {
  render(<SeatSelection onContinue={jest.fn()} onBack={jest.fn()} />);
  const firstSeat = screen.getByRole("button", { name: /^Seat A1,/ });
  firstSeat.focus();
  fireEvent.keyDown(firstSeat, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: /^Seat A3,/ })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: /^Seat A3,/ }), { key: "ArrowDown" });
  expect(screen.getByRole("button", { name: /^Seat B3,/ })).toHaveFocus();
});
