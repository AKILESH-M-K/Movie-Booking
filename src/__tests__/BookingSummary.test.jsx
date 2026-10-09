import { fireEvent, render, screen } from "@testing-library/react";
import BookingSummary from "../components/BookingSummary";
import useBooking from "../hooks/useBooking";
import { useAuth } from "../auth/useAuth";

jest.mock("../hooks/useBooking", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../auth/useAuth", () => ({ useAuth: jest.fn() }));

const updateCustomer = jest.fn();
const prefillCustomer = jest.fn();
const booking = {
  selectedMovie: { title: "Interstellar" },
  selectedTheatre: { name: "PVR INOX", location: "Prozone Mall" },
  selectedShow: { time: "07:30 PM", format: "IMAX" },
  selectedSeats: ["A1", "C1"],
  ticketPrice: 550,
  convenienceCharge: 50,
  totalAmount: 600,
  customer: { name: "Akilesh", email: "akilesh@example.com", phone: "9876543210" },
  updateCustomer,
  prefillCustomer,
};

beforeEach(() => {
  useBooking.mockReturnValue(booking);
  useAuth.mockReturnValue({ user: null });
});

test("shows booking details and continues with valid customer information", () => {
  const onContinue = jest.fn();
  render(<BookingSummary onContinue={onContinue} onBack={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Interstellar" })).toBeInTheDocument();
  expect(screen.getByText("A1, C1")).toBeInTheDocument();
  expect(screen.getByText("₹600")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Continue to Payment/i }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test("blocks continuation when customer details are invalid", () => {
  useBooking.mockReturnValue({
    ...booking,
    customer: { name: "", email: "wrong-email", phone: "123" },
  });
  const onContinue = jest.fn();
  render(<BookingSummary onContinue={onContinue} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Continue to Payment/i }));
  expect(screen.getByText(/Enter your full name/i)).toBeInTheDocument();
  expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();
  expect(screen.getByText(/valid 10-digit phone/i)).toBeInTheDocument();
  expect(onContinue).not.toHaveBeenCalled();
});
