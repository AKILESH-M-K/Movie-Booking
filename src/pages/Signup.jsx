import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import {
  isStrongEnoughPassword,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  sanitizeName,
  sanitizePhone,
} from "../utils/validation";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = sanitizeName(form.name);
    const email = normalizeEmail(form.email);
    const phone = sanitizePhone(form.phone);
    const nextErrors = {};

    if (!name) nextErrors.name = "Full name is required";
    else if (name.length < 2) nextErrors.name = "Enter at least 2 characters";

    if (!email) nextErrors.email = "Email address is required";
    else if (!isValidEmail(email))
      nextErrors.email = "Enter a valid email address";

    if (phone && !isValidPhone(phone)) {
      nextErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!isStrongEnoughPassword(form.password)) {
      nextErrors.password = "Password must be 8–128 characters";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const result = await signup({
      name,
      email,
      phone,
      password: form.password,
    });
    setSubmitting(false);

    if (!result.success) {
      setErrors({ email: result.error });
      return;
    }

    navigate("/login", {
      replace: true,
      state: { signupSuccess: "Account created. Please sign in to continue." },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-12 lg:px-8">
      <div className="w-full max-w-lg rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.12)] sm:p-9">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">
          CineBook Account
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#14213d]">
          Create your profile
        </h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          Your account is created first. You will then sign in to start booking.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <Input
            id="name"
            label="Full Name"
            value={form.name}
            onChange={update("name")}
            placeholder="Your name"
            error={errors.name}
            required
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            error={errors.email}
            required
          />
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={update("phone")}
            placeholder="10-digit mobile number"
            error={errors.phone}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="8–128 characters"
            error={errors.password}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#83755f]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-black text-[#e4572e] hover:text-[#c94423]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
