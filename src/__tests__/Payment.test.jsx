import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Payment from "../components/Payment";
import useBooking from "../hooks/useBooking";

jest.mock("../hooks/useBooking", () => ({ __esModule: true, default: jest.fn() }));

const updatePayment = jest.fn();
const booking = {
  customer: { name: "Akilesh", email: "akilesh@example.com", phone: "9876543210" },
  totalAmount: 600,
  payment: { method: "UPI", upiId: "akilesh@bank" },
  updatePayment,
};

beforeEach(() => useBooking.mockReturnValue(booking));

test("shows the amount and confirms a valid booking", async () => {
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  expect(screen.getByText("₹600")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Confirm booking/i }));
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
});

test("does not confirm when the UPI ID is invalid", async () => {
  useBooking.mockReturnValue({ ...booking, payment: { method: "UPI", upiId: "invalid" } });
  const onConfirm = jest.fn();
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Confirm booking/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/Enter a valid UPI ID/i);
  expect(onConfirm).not.toHaveBeenCalled();
});

test("shows a message if booking confirmation fails", async () => {
  const onConfirm = jest.fn().mockRejectedValue(new Error("failed"));
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Confirm booking/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/Payment could not be completed/i);
});
