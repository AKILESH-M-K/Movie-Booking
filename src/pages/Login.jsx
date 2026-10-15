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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-14 font-sans text-ink-primary lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-canvas-muted bg-surface p-7 shadow-cozy sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl text-white shadow-cozy">
            🎬
          </div>
          <p className="mt-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary">
            CineBook
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-primary">
            Welcome back
          </h1>
          <p className="mt-3 font-sans text-base leading-7 text-ink-secondary">
            Sign in before browsing movies and booking tickets.
          </p>
        </div>

        {(errors.email || errors.password) && (
          <div
            className="mb-5 rounded-xl border border-brand/20 bg-brand-light px-4 py-3 font-sans text-sm font-semibold text-brand"
            role="alert"
          >
            {errors.email || errors.password}
          </div>
        )}

        {location.state?.signupSuccess && (
          <p className="mb-5 rounded-xl border border-canvas-muted bg-surface px-4 py-3 font-sans text-sm font-semibold text-brand shadow-cozy">
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

        <p className="mt-6 text-center font-sans text-sm text-ink-secondary">
          New to CineBook?{" "}
          <Link
            to="/signup"
            className="font-semibold text-brand hover:text-brand-hover"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
