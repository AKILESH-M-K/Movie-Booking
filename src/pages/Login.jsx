import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { safeReturnPath } from "../utils/navigation";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import {
  isStrongEnoughPassword,
  isValidEmail,
  normalizeEmail,
} from "../utils/validation";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = normalizeEmail(email);
    const nextErrors = {};

    if (!cleanEmail) nextErrors.email = "Email address is required";
    else if (!isValidEmail(cleanEmail))
      nextErrors.email = "Enter a valid email address";

    if (!password) nextErrors.password = "Password is required";
    else if (!isStrongEnoughPassword(password)) {
      nextErrors.password = "Password must be 8–128 characters";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const result = await login({ email: cleanEmail, password });
    setSubmitting(false);

    if (!result.success) {
      setErrors({ [result.field || "email"]: result.error });
      return;
    }

    navigate(safeReturnPath(location.state?.from), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-14 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.12)] sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4572e] text-2xl shadow-md">
            🎬
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#667085]">
            CineBook
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#14213d]">
            Welcome back
          </h1>
          <p className="mt-3 text-base leading-7 text-[#667085]">
            Sign in before browsing movies and booking tickets.
          </p>
        </div>

        {(errors.email || errors.password) && (
          <div
            className="mb-5 rounded-xl border border-[#f7c8bb] bg-[#fff7f4] px-4 py-3 text-sm font-bold text-[#9f5525]"
            role="alert"
          >
            {errors.email || errors.password}
          </div>
        )}

        {location.state?.signupSuccess && (
          <p className="mb-5 rounded-xl border border-[#b8e0d2] bg-[#e6f5ef] px-4 py-3 text-sm font-bold text-[#147d61]">
            {location.state.signupSuccess}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8–128 characters"
            error={errors.password}
            required
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#83755f]">
          New to CineBook?{" "}
          <Link
            to="/signup"
            className="font-black text-[#e4572e] hover:text-[#c94423]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
