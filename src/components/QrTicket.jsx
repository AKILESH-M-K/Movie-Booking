import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { makeTicketUrl } from "../utils/ticketUrl";

function QrTicket({ booking }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");
  const demoConfirmed = booking.status === "demo_confirmed" && booking.paymentMode === "demo"
    && Boolean(booking.demoConfirmedAt && booking.demoReference);
  const providerVerified = booking.status === "paid" && Boolean(
    booking.paymentProvider && booking.providerTransactionId && booking.paymentVerifiedAt,
  );
  const verified = demoConfirmed || providerVerified;

  const ticketUrl = useMemo(
    () => makeTicketUrl(booking.bookingId),
    [booking.bookingId],
  );

  useEffect(() => {
    let active = true;
    if (!verified) return () => { active = false; };
    QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 220,
      color: { dark: "#1A1715", light: "#FFF7FB" },
    })
      .then((dataUrl) => { if (active) setSrc(dataUrl); })
      .catch(() => { if (active) setError("QR code could not be generated."); });
    return () => { active = false; };
  }, [ticketUrl, verified]);

  if (!verified) return <p role="status" className="font-sans text-xs text-ink-secondary">{error || "Payment not verified; no ticket QR is available."}</p>;

  return (
    <div className="ticket-qr-wrap">
      <div className="ticket-qr-frame" title="Scan to open the pink ticket page">
        {src ? (
          <img src={src} alt={`QR code to open the pink ticket for ${booking.movie}`} />
        ) : (
          <span aria-live="polite" className="font-sans text-xs text-ink-tertiary">
            {error || "Generating ticket QR…"}
          </span>
        )}
      </div>
      <p className="ticket-qr-caption font-sans text-xs font-medium text-ink-secondary">
        {demoConfirmed ? "DEMO ONLY · opens preview ticket · no payment taken · not real admission" : "Scan to open your movie ticket page"}
      </p>
      <p className="ticket-qr-ref font-mono text-[11px] font-bold text-ink-tertiary">
        {demoConfirmed ? booking.demoReference : booking.paymentReference || booking.bookingId}
      </p>
    </div>
  );
}

export default QrTicket;
