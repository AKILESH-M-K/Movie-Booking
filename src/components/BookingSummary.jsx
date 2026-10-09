import { useEffect, useId, useState } from "react";
import useBooking from "../hooks/useBooking";
import { useAuth } from "../auth/useAuth";
import Input from "./common/Input";
import { isValidEmail, isValidPhone, sanitizeName, sanitizePhone } from "../utils/validation";

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
    prefillCustomer,
  } = useBooking();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const ids = { name: useId(), email: useId(), phone: useId() };

  // Pre-fill contact details from the signed-in profile once per visit so the
  // user does not retype information they already gave us. Only blank fields
  // are filled, and the effect is keyed on the email so it cannot re-dispatch
  // on every render (which previously caused an infinite update loop).
  const profileEmail = user?.email;
  const profileName = user?.name;
  const profilePhone = user?.phone;
  useEffect(() => {
    if (!profileEmail) return;
    prefillCustomer({ name: profileName, email: profileEmail, phone: profilePhone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileEmail]);

  const hasRequiredDetails =
    Boolean(customer.name) && Boolean(customer.email) && Boolean(customer.phone);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (sanitizeName(customer.name).length < 2) nextErrors.name = "Enter your full name (at least 2 characters).";
    if (!isValidEmail(customer.email)) nextErrors.email = "Enter a valid email address.";
    if (!isValidPhone(sanitizePhone(customer.phone))) nextErrors.phone = "Enter a valid 10-digit phone number.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onContinue();
  };

  const seatsLabel = selectedSeats.join(", ") || "None";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#667085] hover:text-[#e4572e]">
          ← Back to Seats
        </button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">Step 5 of 6</p>
        <h1 className="mt-2 text-4xl font-black text-[#14213d]">Booking Summary</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          Review your booking. {hasRequiredDetails && user ? "Your contact details come from your profile." : "Enter the details missing from your profile."}
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="summary-heading" className="rounded-2xl border border-[#e4e7ec] bg-[#ffffff] p-6 shadow-sm sm:p-7">
            <h2 id="summary-heading" className="text-2xl font-black text-[#1d3557]">{selectedMovie?.title}</h2>
            <dl className="mt-6 space-y-4 text-base">
              <SummaryRow label="Theatre" value={selectedTheatre?.name || "Not selected"} />
              <SummaryRow label="Location" value={selectedTheatre?.location || "—"} />
              <SummaryRow label="Show" value={selectedShow?.time || "Not selected"} />
              <SummaryRow label="Format" value={selectedShow?.format || "—"} />
              <SummaryRow label="Seats" value={seatsLabel} highlight />
            </dl>
            <dl className="mt-7 border-t border-[#e4e7ec] pt-5">
              <SummaryRow label="Tickets" value={`₹${ticketPrice}`} />
              <SummaryRow label="Convenience charge" value={`₹${convenienceCharge}`} />
              <div className="mt-5 flex items-center justify-between border-t border-[#e4e7ec] pt-5">
                <dt className="text-xl font-black text-[#1d3557]">Total</dt>
                <dd className="text-2xl font-black text-[#e4572e]">₹{totalAmount}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="contact-heading" className="rounded-2xl border border-[#e4e7ec] bg-[#ffffff] p-6 shadow-sm sm:p-7">
            <h2 id="contact-heading" className="text-2xl font-black text-[#1d3557]">Contact details</h2>
            <p className="mt-2 text-base leading-7 text-[#667085]">These details will be attached to your ticket.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <Input
                id={ids.name}
                label="Full name"
                value={customer.name}
                placeholder="Enter your full name"
                onChange={(e) => updateCustomer("name", e.target.value)}
                error={errors.name}
                required
              />
              <Input
                id={ids.email}
                label="Email address"
                type="email"
                value={customer.email}
                placeholder="you@example.com"
                onChange={(e) => updateCustomer("email", e.target.value)}
                error={errors.email}
                required
              />
              <Input
                id={ids.phone}
                label="Phone number"
                type="tel"
                inputMode="numeric"
                value={customer.phone}
                placeholder="10-digit mobile number"
                onChange={(e) => updateCustomer("phone", e.target.value)}
                error={errors.phone}
                required
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#e4572e] py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#c94423] hover:shadow-xl"
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
      <dt className="text-[#667085]">{label}</dt>
      <dd className={`text-right font-bold ${highlight ? "text-[#e4572e]" : "text-[#344054]"}`}>{value}</dd>
    </div>
  );
}

export default BookingSummary;
