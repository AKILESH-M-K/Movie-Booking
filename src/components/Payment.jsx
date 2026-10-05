import { useId } from "react";
import useBooking from "../hooks/useBooking";
import {
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
  isValidUpi,
} from "../utils/validation";

function Payment({ onConfirm, onBack }) {
  const { customer, totalAmount, payment, updatePayment } = useBooking();
  const upiId = useId();
  const cardId = useId();
  const expiryId = useId();
  const cvvId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (payment.method === "UPI" && !isValidUpi(payment.upiId)) {
      return alert("Please enter a valid UPI ID.");
    }

    if (payment.method === "Card") {
      if (!isValidCardNumber(payment.cardNumber)) {
        return alert("Please enter a valid card number.");
      }
      if (!isValidExpiry(payment.expiry)) {
        return alert("Please enter a valid future expiry date.");
      }
      if (!isValidCvv(payment.cvv)) {
        return alert("Please enter a valid CVV.");
      }
    }

    onConfirm();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="mb-8 text-base font-bold text-[#7e715b] transition hover:-translate-x-1 hover:text-[#a4652a]">← Back to Summary</button>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">Step 6 of 6</p>
        <h1 className="mt-2 text-4xl font-black text-[#3d3324]">Payment</h1>
        <p className="mt-3 text-base leading-7 text-[#736956]">Choose a payment method to complete your CineBook reservation.</p>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-[#453928]">Booking Details</h2>
            <div className="mt-6 space-y-5 text-base">
              <Detail label="Name" value={customer.name} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Phone" value={customer.phone} />
            </div>
            <div className="mt-7 rounded-2xl bg-[#faeede] p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-[#967046]">Amount to Pay</p>
              <p className="mt-1 text-3xl font-black text-[#a4652a]">₹{totalAmount}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-[#453928]">Payment Method</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {['UPI', 'Card'].map((method) => (
                  <button key={method} type="button" onClick={() => updatePayment("method", method)} className={`rounded-xl border px-4 py-3.5 text-base font-black transition-all hover:-translate-y-0.5 ${payment.method === method ? "border-[#a4652a] bg-[#faeede] text-[#a4652a] shadow-sm" : "border-[#e4dac2] bg-[#fefbf1] text-[#7d705a] hover:border-[#ce9d68]"}`}>{method}</button>
                ))}
              </div>

              {payment.method === "UPI" ? (
                <div>
                  <label htmlFor={upiId} className="mb-2 block text-base font-bold text-[#534632]">UPI ID</label>
                  <input id={upiId} type="text" value={payment.upiId} placeholder="example@upi" autoComplete="off" onChange={(e) => updatePayment("upiId", e.target.value)} className="w-full rounded-xl border border-[#e3d8c0] bg-[#fefbf1] px-4 py-3.5 text-base text-[#3d3324] outline-none transition focus:border-[#c9803d] focus:ring-4 focus:ring-[#c9803d]/10 placeholder:text-[#b0a48c]" required />
                </div>
              ) : (
                <div className="space-y-4">
                  <Field id={cardId} label="Card Number" value={payment.cardNumber} placeholder="Card number" autoComplete="off" onChange={(value) => updatePayment("cardNumber", value.replace(/\D/g, "").slice(0, 16))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field id={expiryId} label="Expiry" value={payment.expiry} placeholder="MM/YY" onChange={(value) => updatePayment("expiry", value)} />
                    <Field id={cvvId} label="CVV" type="password" value={payment.cvv} placeholder="•••" autoComplete="off" onChange={(value) => updatePayment("cvv", value.replace(/\D/g, "").slice(0, 3))} />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full rounded-xl bg-[#a4652a] py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#875022] hover:shadow-xl">Pay ₹{totalAmount} & Confirm Booking</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }) {
  return <div><p className="text-sm font-bold uppercase tracking-wide text-[#9d8d71]">{label}</p><p className="mt-1 break-words text-base font-bold leading-6 text-[#4b3f2d]">{value || "—"}</p></div>;
}

function Field({ id, label, type = "text", value, placeholder, onChange }) {
  return <div><label htmlFor={id} className="mb-2 block text-base font-bold text-[#534632]">{label}</label><input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#e3d8c0] bg-[#fefbf1] px-4 py-3.5 text-base text-[#3d3324] outline-none transition focus:border-[#c9803d] focus:ring-4 focus:ring-[#c9803d]/10 placeholder:text-[#b0a48c]" required /></div>;
}

export default Payment;
