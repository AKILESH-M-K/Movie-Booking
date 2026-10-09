import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

function QrTicket({ booking }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  const ticketUrl = useMemo(() => {
    const url = new URL(`${window.location.origin}/Movie-Booking/ticket/${encodeURIComponent(booking.bookingId)}`);
    const values = {
      id: booking.bookingId,
      movie: booking.movie,
      theatre: booking.theatre,
      show: booking.show,
      seats: booking.seats?.join(", "),
      amount: booking.amount,
      ref: booking.paymentReference || booking.bookingId,
      status: booking.status,
    };
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
    return url.toString();
  }, [booking]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 220,
      color: { dark: "#14213d", light: "#ffffff" },
    })
      .then((dataUrl) => { if (active) setSrc(dataUrl); })
      .catch(() => { if (active) setError("QR code could not be generated."); });
    return () => { active = false; };
  }, [ticketUrl]);

  return (
    <div className="ticket-qr-wrap">
      <div className="ticket-qr-frame" aria-label="Scannable ticket QR code">
        {src ? <img src={src} alt="Scan to open the verified CineBook ticket" /> : <span aria-live="polite">{error || "Generating…"}</span>}
      </div>
      <p className="ticket-qr-caption">Scan to open verified ticket</p>
      <p className="ticket-qr-ref">{booking.paymentReference || booking.bookingId}</p>
    </div>
  );
}

export default QrTicket;
