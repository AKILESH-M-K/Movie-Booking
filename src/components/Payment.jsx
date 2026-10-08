import { useId, useState } from "react";
import useBooking from "../hooks/useBooking";
import { isValidUpi } from "../utils/validation";

// Payment note: CineBook does not collect or store card numbers or CVVs in the
// browser. In production, payment is handled by a PCI-compliant gateway
// (for example Razorpay or Stripe) that returns a verified payment reference
// which the backend confirms before issuing the ticket.
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
    } catch {
      setError("Payment could not be completed. No amount was charged. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#7e715b] hover:text-[#a4652a]">
          ← Back to Summary
        </button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">Step 6 of 6</p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">Payment</h1>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-[#e8ccb1] bg-[#fff2e8] px-4 py-3 text-sm font-bold text-[#9f5525]">
            {error}
          </p>
        )}

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="booking-details-heading" className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 id="booking-details-heading" className="text-2xl font-black text-[#453928]">Booking details</h2>
            <dl className="mt-6 space-y-5 text-base">
              <Detail label="Name" value={customer.name} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Phone" value={customer.phone} />
            </dl>
            <div className="mt-7 rounded-2xl bg-[#faeede] p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-[#967046]">Amount to pay</p>
              <p className="mt-1 text-3xl font-black text-[#a4652a]">₹{totalAmount}</p>
            </div>
          </section>

          <section aria-labelledby="payment-method-heading" className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 id="payment-method-heading" className="text-2xl font-black text-[#453928]">Payment method</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Choose payment method">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={method === item.id}
                    onClick={() => updatePayment("method", item.id)}
                    className={`rounded-xl border px-4 py-3.5 text-base font-black transition-all hover:-translate-y-0.5 ${
                      method === item.id
                        ? "border-[#a4652a] bg-[#faeede] text-[#a4652a] shadow-sm"
                        : "border-[#e4dac2] bg-[#fefbf1] text-[#7d705a] hover:border-[#ce9d68]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {method === "UPI" ? (
                <div>
                  <label htmlFor={upiId} className="mb-2 block text-base font-bold text-[#534632]">UPI ID</label>
                  <input
                    id={upiId}
                    type="text"
                    value={payment.upiId}
                    placeholder="name@bank"
                    autoComplete="off"
                    onChange={(e) => updatePayment("upiId", e.target.value)}
                    className="w-full rounded-xl border border-[#e3d8c0] bg-[#fefbf1] px-4 py-3.5 text-base text-[#3d3324] outline-none transition focus:border-[#c9803d] focus:ring-4 focus:ring-[#c9803d]/10 placeholder:text-[#b0a48c]"
                  />
                </div>
              ) : (
                <p className="rounded-xl bg-[#fcf8ec] px-4 py-3 text-sm font-bold leading-6 text-[#594d3b]">
                  Your seats are reserved. Pay at the theatre counter before the show starts.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#a4652a] py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#875022] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-45"
              >
                {submitting ? "Confirming…" : `Confirm booking · ₹${totalAmount}`}
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
      <dt className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">{label}</dt>
      <dd className="mt-1 break-words text-base font-bold leading-6 text-[#4b3f2d]">{value || "—"}</dd>
    </div>
  );
}

export default Payment;
