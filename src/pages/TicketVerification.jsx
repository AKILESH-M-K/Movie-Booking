import { Link, useSearchParams } from "react-router-dom";

function TicketVerification() {
  const [params] = useSearchParams();
  const bookingId = params.get("id") || "—";
  const movie = params.get("movie") || "Movie ticket";
  const theatre = params.get("theatre") || "—";
  const show = params.get("show") || "—";
  const seats = params.get("seats") || "—";
  const amount = params.get("amount") || "—";
  const reference = params.get("ref") || "—";
  const status = params.get("status") || "paid";

  return (
    <main className="ticket-verify-page">
      <div className="ticket-verify-shell">
        <div className="ticket-verify-brand"><span>CB</span> CineBook</div>
        <section className="ticket-verify-card" aria-labelledby="ticket-verification-title">
          <div className="ticket-verify-topline">
            <span className="ticket-verify-kicker">Digital movie ticket</span>
            <span className="ticket-verify-status">✓ {status === "paid" ? "Paid" : status}</span>
          </div>
          <div className="ticket-verify-check">✓</div>
          <p className="ticket-verify-overline">Ticket verified</p>
          <h1 id="ticket-verification-title">{movie}</h1>
          <p className="ticket-verify-subtitle">This CineBook ticket is valid for entry.</p>

          <div className="ticket-verify-details">
            <Detail label="Theatre" value={theatre} />
            <Detail label="Show" value={show} />
            <Detail label="Seats" value={seats} />
            <Detail label="Amount paid" value={`₹${amount}`} />
          </div>

          <div className="ticket-verify-reference">
            <span>Booking ID</span><strong>{bookingId}</strong>
            <span>Payment reference</span><strong>{reference}</strong>
          </div>
          <p className="ticket-verify-note">Present this verified ticket at the theatre entrance.</p>
        </section>
        <Link className="ticket-verify-back" to="/">Book another movie</Link>
      </div>
    </main>
  );
}

function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

export default TicketVerification;
