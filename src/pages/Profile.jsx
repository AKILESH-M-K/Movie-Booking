import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { isValidPhone, sanitizeName, sanitizePhone } from "../utils/validation";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanName = sanitizeName(name);
    const cleanPhone = sanitizePhone(phone);

    if (cleanName.length < 2) {
      setError("Enter a valid name");
      setMessage("");
      return;
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setError("Enter a valid 10-digit phone number");
      setMessage("");
      return;
    }

    updateProfile({ name: cleanName, phone: cleanPhone });
    setError("");
    setMessage("Profile updated successfully.");
  };

  return (
    <main className="min-h-[calc(100vh-150px)] bg-[#f9f4e4] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.10)] sm:p-10">
          <div className="flex flex-col gap-5 border-b border-[#efe8d5] pb-7 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#a4652a] text-3xl font-black text-white shadow-lg">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9a7547]">
                My Profile
              </p>
              <h1 className="mt-1 text-3xl font-black text-[#3d3324]">
                {user?.name}
              </h1>
              <p className="mt-1 text-[#736956]">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <Input
              id="profileName"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error === "Name is required" ? error : ""}
              required
            />
            <Input
              id="profileEmail"
              label="Email Address"
              value={user?.email || ""}
              readOnly
            />
            <Input
              id="profilePhone"
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(sanitizePhone(e.target.value))}
              error={error && error !== "Name is required" ? error : ""}
              placeholder="10-digit mobile number"
            />

            {message && (
              <p className="rounded-xl border border-[#b8c9ae] bg-[#edf4e9] px-4 py-3 text-sm font-bold text-[#45613e]">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Save Profile</Button>
              <Link
                to="/bookings"
                className="inline-flex items-center justify-center rounded-xl border border-[#dbcfb4] bg-[#fcf7eb] px-5 py-3 text-sm font-black text-[#5e5039] transition hover:-translate-y-0.5 hover:bg-[#f9efdd]"
              >
                My Bookings
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Profile;
