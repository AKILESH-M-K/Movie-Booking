import { useId } from "react";
import useBooking from "../hooks/useBooking";
import { isValidEmail, isValidPhone } from "../utils/validation";

function BookingSummary({ onContinue, onBack }) {
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    ticketPrice,
    convenienceCharge,
    totalAmount,
    customer,
    updateCustomer,
  } = useBooking();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();

  const valid =
    customer.name.trim().length >= 2 &&
    isValidEmail(customer.email) &&
    isValidPhone(customer.phone);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!customer.name.trim()) return alert("Please enter your name.");
    if (!isValidEmail(customer.email))
      return alert("Please enter a valid email address.");
    if (!isValidPhone(customer.phone))
      return alert("Please enter a valid 10-digit phone number.");
    onContinue();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-base font-bold text-[#7e715b] transition hover:-translate-x-1 hover:text-[#a4652a]"
        >
          ← Back to Seats
        </button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">
          Step 5 of 6
        </p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">
          Booking Summary
        </h1>
        <p className="mt-3 text-base leading-7 text-[#736956]">
          Review your booking and enter your contact information.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-[#453928]">
              {selectedMovie?.title}
            </h2>
            <div className="mt-6 space-y-4 text-base">
              <SummaryRow
                label="Theatre"
                value={selectedTheatre?.name || "Not selected"}
              />
              <SummaryRow
                label="Location"
                value={selectedTheatre?.location || "—"}
              />
              <SummaryRow
                label="Show"
                value={selectedShow?.time || "Not selected"}
              />
              <SummaryRow label="Format" value={selectedShow?.format || "—"} />
              <SummaryRow
                label="Seats"
                value={selectedSeats.join(", ") || "None"}
                highlight
              />
            </div>
            <div className="mt-7 border-t border-[#efe8d6] pt-5">
              <SummaryRow label="Tickets" value={`₹${ticketPrice}`} />
              <SummaryRow
                label="Convenience charge"
                value={`₹${convenienceCharge}`}
              />
              <div className="mt-5 flex items-center justify-between border-t border-[#efe8d6] pt-5">
                <span className="text-xl font-black text-[#453928]">Total</span>
                <span className="text-2xl font-black text-[#a4652a]">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-[#453928]">
              Customer Information
            </h2>
            <p className="mt-2 text-base leading-7 text-[#7e715b]">
              These details will be attached to your booking confirmation.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field
                id={nameId}
                label="Full Name"
                value={customer.name}
                placeholder="Enter your full name"
                onChange={(value) => updateCustomer("name", value)}
              />
              <Field
                id={emailId}
                label="Email Address"
                type="email"
                value={customer.email}
                placeholder="Enter your email"
                onChange={(value) => updateCustomer("email", value)}
              />
              <Field
                id={phoneId}
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                value={customer.phone}
                placeholder="10-digit phone number"
                onChange={(value) =>
                  updateCustomer("phone", value.replace(/\D/g, "").slice(0, 10))
                }
              />
              <button
                type="submit"
                disabled={!valid}
                className="w-full rounded-xl bg-[#a4652a] py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#875022] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-[#a4652a]"
              >
                Continue to Payment →
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-[#847960]">{label}</span>
      <span
        className={`text-right font-bold ${highlight ? "text-[#a4652a]" : "text-[#4b3f2d]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  inputMode,
  value,
  placeholder,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-bold text-[#534632]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#e3d8c0] bg-[#fefbf1] px-4 py-3.5 text-base text-[#3d3324] outline-none transition focus:border-[#c9803d] focus:ring-4 focus:ring-[#c9803d]/10 placeholder:text-[#b0a48c]"
        required
      />
    </div>
  );
}

export default BookingSummary;
