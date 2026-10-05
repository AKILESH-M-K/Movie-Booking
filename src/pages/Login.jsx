import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
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

    const destination = location.state?.from || "/home";
    navigate(destination, { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9f4e4] px-5 py-14 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.12)] sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a4652a] text-2xl shadow-md">
            🎬
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">
            CineBook
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#3d3324]">
            Welcome back
          </h1>
          <p className="mt-3 text-base leading-7 text-[#736956]">
            Sign in before browsing movies and booking tickets.
          </p>
        </div>

        {(errors.email || errors.password) && (
          <div
            className="mb-5 rounded-xl border border-[#e8ccb1] bg-[#fff2e8] px-4 py-3 text-sm font-bold text-[#9f5525]"
            role="alert"
          >
            {errors.email || errors.password}
          </div>
        )}

        {location.state?.signupSuccess && (
          <p className="mb-5 rounded-xl border border-[#b8c9ae] bg-[#edf4e9] px-4 py-3 text-sm font-bold text-[#45613e]">
            {location.state.signupSuccess}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            id="email"
            label="Email Address"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8–128 characters"
            error={errors.password}
            required
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Verifying..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#83755f]">
          New to CineBook?{" "}
          <Link
            to="/signup"
            className="font-black text-[#a4652a] hover:text-[#875022]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
