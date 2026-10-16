import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Payment from "../components/Payment";
import useBooking from "../hooks/useBooking";

jest.mock("../hooks/useBooking", () => ({ __esModule: true, default: jest.fn() }));

const updatePayment = jest.fn();
const booking = {
  customer: { name: "Sample Viewer", email: "sample@example.invalid", phone: "9000000000" },
  totalAmount: 600,
  payment: { method: "UPI", upiId: "sample@bank" },
  updatePayment,
};

beforeEach(() => useBooking.mockReturnValue(booking));

test("shows demo-only no-charge copy and confirms the demo booking", async () => {
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  expect(screen.getByText("₹600")).toBeInTheDocument();
  expect(screen.getByText(/no money will be charged/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Confirm demo booking/i }));
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
});

test("does not require a UPI ID for a demo confirmation", async () => {
  useBooking.mockReturnValue({ ...booking, payment: { method: "UPI", upiId: "invalid" } });
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Confirm demo booking/i }));
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
});

test("shows server errors when a demo confirmation cannot be created", async () => {
  const onConfirm = jest.fn().mockRejectedValue(new Error("Demo confirmation is unavailable."));
  render(<Payment onConfirm={onConfirm} onBack={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Confirm demo booking/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/Demo confirmation is unavailable/i);
});
