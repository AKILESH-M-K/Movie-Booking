import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import useBooking from "../hooks/useBooking";
import InstallPWA from "./InstallPWA";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { clearBooking } = useBooking();

  const navClass = ({ isActive }) =>
    `font-sans text-sm font-medium transition-all hover:-translate-y-0.5 ${
      isActive ? "text-brand font-semibold" : "text-ink-secondary hover:text-brand"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-canvas-muted bg-surface/95 shadow-cozy backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Brand / Logo */}
        <NavLink to="/home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-xl text-white shadow-cozy transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            🎬
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-ink-primary">
              CINEBOOK
            </h1>
            <p className="hidden font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-ink-tertiary sm:block">
              Cinema Lounge
            </p>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/home" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/movies" className={navClass}>
            Movies
          </NavLink>
          <NavLink to="/bookings" className={navClass}>
            My Bookings
          </NavLink>
        </nav>

        {/* Right Section: Install Button + User Info / Auth */}
        <div className="flex items-center gap-3">
          <InstallPWA />

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition hover:bg-canvas"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm font-sans">
                  {(user.name?.[0] || "U").toUpperCase()}
                </span>
                <span className="hidden font-sans text-sm font-medium text-ink-secondary sm:block">
                  Hi, {user.name}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  clearBooking();
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded-xl border border-canvas-muted bg-surface px-4 py-2 font-sans text-xs font-semibold text-ink-primary shadow-cozy transition-all hover:bg-canvas hover:text-brand active:scale-[0.99]"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-xl border border-canvas-muted bg-surface px-4 py-2 font-sans text-xs font-semibold text-ink-primary shadow-cozy transition-all hover:bg-canvas hover:text-brand active:scale-[0.99]"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
