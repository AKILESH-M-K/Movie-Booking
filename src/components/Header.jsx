import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import useBooking from "../hooks/useBooking";
import InstallPWA from "./InstallPWA";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { clearBooking } = useBooking();

  const navClass = ({ isActive }) =>
    `text-base font-bold transition-all hover:-translate-y-0.5 ${
      isActive ? "text-[#e4572e]" : "text-[#776a54] hover:text-[#e4572e]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5dcc5]/80 bg-[#ffffff]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Brand / Logo */}
        <NavLink to="/home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4572e] text-xl shadow-md shadow-[#e4572e]/20 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            🎬
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-[#14213d]">
              CINEBOOK
            </h1>
            <p className="hidden text-xs font-bold uppercase tracking-[0.22em] text-[#9d8d6f] sm:block">
              Movie Booking
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
          {/* PWA Install Button Component */}
          <InstallPWA />

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[#fff1ed]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4572e] text-sm font-black text-white">
                  {(user.name?.[0] || "U").toUpperCase()}
                </span>
                <span className="hidden text-sm font-bold text-[#776a54] sm:block">
                  Hi, {user.name}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  // Clear the in-progress booking and the session together so
                  // nothing from the previous user remains visible.
                  clearBooking();
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#344054] transition-all hover:-translate-y-0.5 hover:border-[#e4572e] hover:bg-[#fff1ed] hover:text-[#c94423]"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#344054] transition-all hover:-translate-y-0.5 hover:border-[#e4572e] hover:bg-[#fff1ed] hover:text-[#c94423]"
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
