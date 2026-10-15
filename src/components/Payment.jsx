import { useId, useState } from "react";
import useBooking from "../hooks/useBooking";
import { isValidUpi } from "../utils/validation";

const METHODS = [
  { id: "UPI", label: "UPI" },
  { id: "Pay at Theatre", label: "Pay at theatre" },
];

function Payment({ onConfirm, onBack }) {
  const { customer, totalAmount, payment, updatePayment } = useBooking();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const upiId = useId();

  const method = METHODS.some((item) => item.id === payment.method) ? payment.method : "UPI";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (method === "UPI" && !isValidUpi(payment.upiId)) {
      setError("Enter a valid UPI ID, for example name@bank.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Demo booking confirmation failed:", err);
      setError("Payment could not be completed because the booking could not be saved. No amount was charged. Please try again.");
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
          Secure checkout
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-secondary font-sans">
          Confirm a simulated demo booking and issue a ticket QR. No real payment is processed.
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
                Amount to pay
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
              Payment method
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5 font-sans" noValidate>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Choose payment method">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={method === item.id}
                    onClick={() => updatePayment("method", item.id)}
                    className={`rounded-xl border px-4 py-3.5 text-base font-semibold font-sans transition-all active:scale-[0.99] ${
                      method === item.id
                        ? "border-brand bg-brand-light text-brand shadow-cozy"
                        : "border-canvas-muted bg-surface text-ink-secondary hover:border-brand/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {method === "UPI" ? (
                <div>
                  <label htmlFor={upiId} className="mb-2 block text-sm font-medium text-ink-primary">
                    UPI ID
                  </label>
                  <input
                    id={upiId}
                    type="text"
                    value={payment.upiId}
                    placeholder="name@bank"
                    autoComplete="off"
                    onChange={(e) => updatePayment("upiId", e.target.value)}
                    className="w-full rounded-xl border border-canvas-muted bg-surface px-4 py-3.5 text-base text-ink-primary outline-none transition placeholder:text-ink-tertiary focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-canvas-muted bg-canvas/30 px-4 py-3 text-sm font-medium leading-6 text-ink-secondary">
                  Your seats are reserved. Pay at the theatre counter before the show starts.
                </p>
              )}

              <div className="rounded-xl border border-brand/20 bg-brand-light/50 px-4 py-3 text-xs leading-5 text-brand font-medium">
                Demo mode · This checkout does not charge money or contact a bank.
              </div>
              <button
                type="submit"
                aria-label="Confirm booking (demo — no charge)"
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-4 text-base font-semibold font-sans text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {submitting ? "Confirming demo booking…" : `Confirm demo booking · ₹${totalAmount}`}
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
