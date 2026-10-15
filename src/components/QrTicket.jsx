import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

function QrTicket({ booking }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  // The QR intentionally contains ticket data, not a URL, so scanning it does
  // not redirect guests to the booking website. This is a demo admission pass.
  const ticketPayload = useMemo(
    () =>
      JSON.stringify({
        type: "CineBook-Demo-Ticket",
        bookingId: booking.bookingId,
        movie: booking.movie,
        theatre: booking.theatre,
        show: booking.show,
        seats: booking.seats,
        status: booking.status,
      }),
    [booking],
  );

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(ticketPayload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 220,
      color: { dark: "#1A1715", light: "#FFF7FB" },
    })
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch(() => {
        if (active) setError("QR code could not be generated.");
      });
    return () => {
      active = false;
    };
  }, [ticketPayload]);

  return (
    <div className="ticket-qr-wrap">
      <div className="ticket-qr-frame" title="Scannable demo ticket details">
        {src ? (
          <img src={src} alt={`Scannable ticket details for ${booking.movie}`} />
        ) : (
          <span aria-live="polite" className="font-sans text-xs text-ink-tertiary">
            {error || "Generating ticket QR…"}
          </span>
        )}
      </div>
      <p className="ticket-qr-caption font-sans text-xs font-medium text-ink-secondary">
        Scan to read ticket details · no website link
      </p>
      <p className="ticket-qr-ref font-mono text-[11px] font-bold text-ink-tertiary">
        {booking.paymentReference || booking.bookingId}
      </p>
    </div>
  );
}

export default QrTicket;
