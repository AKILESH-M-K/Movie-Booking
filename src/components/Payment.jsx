import { useState } from "react";
import useBooking from "../hooks/useBooking";

function Payment({ onConfirm, onBack }) {
  const { customer, totalAmount } = useBooking();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment status could not be confirmed. No ticket was issued.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-10 font-sans text-ink-primary lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-1.5 text-base font-medium font-sans text-ink-secondary hover:text-brand transition"
        >
          ← Back to Summary
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary font-sans">
          Step 6 of 6
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink-primary">
          Demo checkout
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-secondary font-sans">
          This prototype creates a demo booking confirmation only. It does not contact a bank or payment provider, and no money will be charged.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-brand/20 bg-brand-light px-4 py-3 text-sm font-semibold text-brand font-sans"
          >
            {error}
          </p>
        )}

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="booking-details-heading"
            className="rounded-2xl border border-canvas-muted bg-surface p-6 shadow-cozy sm:p-7"
          >
            <h2 id="booking-details-heading" className="font-serif text-2xl font-bold text-ink-primary">
              Booking details
            </h2>
            <dl className="mt-6 space-y-5 font-sans text-base">
              <Detail label="Name" value={customer.name} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Phone" value={customer.phone} />
            </dl>
            <div className="mt-7 rounded-xl border border-canvas-muted bg-canvas/40 p-5">
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                Display amount · demo only
              </p>
              <p className="mt-1 font-sans text-3xl font-bold text-brand">
                ₹{totalAmount}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="payment-method-heading"
            className="rounded-2xl border border-canvas-muted bg-surface p-6 shadow-cozy sm:p-7"
          >
            <h2 id="payment-method-heading" className="font-serif text-2xl font-bold text-ink-primary">
              Confirmation mode
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5 font-sans" noValidate>
              <div className="rounded-xl border border-pink-300 bg-pink-50 px-5 py-5">
                <p className="font-sans text-sm font-bold uppercase tracking-wider text-pink-800">Demo mode · no charge</p>
                <p className="mt-2 text-sm leading-6 text-pink-900">
                  Confirming creates a clearly marked demo ticket so you can test the booking flow. It is not proof of payment and cannot be used as a real paid booking.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-4 text-base font-semibold font-sans text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {submitting ? "Creating demo confirmation…" : "Confirm demo booking"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="font-sans text-xs font-bold uppercase tracking-wider text-ink-tertiary">
        {label}
      </dt>
      <dd className="mt-1 break-words font-sans text-base font-semibold leading-6 text-ink-primary">
        {value || "—"}
      </dd>
    </div>
  );
}

export default Payment;
