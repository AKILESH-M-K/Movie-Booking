import { render, screen, waitFor } from "@testing-library/react";
import QrTicket from "../components/QrTicket";
import QRCode from "qrcode";

jest.mock("qrcode", () => ({
  __esModule: true,
  default: { toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,demo-ticket") },
}));

test("renders a demo QR with an explicit no-charge, not-real-admission label", async () => {
  const booking = {
    bookingId: "CBDEMO123",
    movie: "Inception",
    theatre: "PVR INOX",
    show: "10:00 AM",
    showDate: "2026-10-17",
    seats: ["A1"],
    status: "demo_confirmed",
    paymentMode: "demo",
    demoReference: "DEMO-ABCDE12345",
    demoConfirmedAt: "2026-10-16T00:00:00.000Z",
  };

  render(<QrTicket booking={booking} />);

  expect(await screen.findByAltText("QR code to open the pink ticket for Inception")).toHaveAttribute(
    "src",
    "data:image/png;base64,demo-ticket",
  );
  expect(screen.getByText(/DEMO ONLY.*no payment taken.*not real admission/i)).toBeInTheDocument();
  expect(screen.getByText("DEMO-ABCDE12345")).toBeInTheDocument();
  await waitFor(() => expect(QRCode.toDataURL).toHaveBeenCalledWith(
    "http://localhost/Movie-Booking/ticket/CBDEMO123",
    expect.objectContaining({ width: 220 }),
  ));
});

test("does not issue a QR for an unconfirmed booking", () => {
  render(<QrTicket booking={{ bookingId: "CBPENDING", status: "pending_payment" }} />);
  expect(screen.getByRole("status")).toHaveTextContent(/Payment not verified/i);
  expect(QRCode.toDataURL).not.toHaveBeenCalled();
});
