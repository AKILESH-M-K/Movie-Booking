import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useBooking from "../hooks/useBooking";
import InstallPWA from "./InstallPWA";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { clearBooking } = useBooking();

  const navClass = ({ isActive }) =>
    `text-base font-bold transition-all hover:-translate-y-0.5 ${
      isActive ? "text-[#a4652a]" : "text-[#776a54] hover:text-[#a4652a]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5dcc5]/80 bg-[#fffcf5]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Brand / Logo */}
        <NavLink to="/home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a4652a] text-xl shadow-md shadow-[#a4652a]/20 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            🎬
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-[#3d3324]">
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
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[#f9efdd]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a4652a] text-sm font-black text-white">
                  {(user.name?.[0] || "U").toUpperCase()}
                </span>
                <span className="hidden text-sm font-bold text-[#776a54] sm:block">
                  Hi, {user.name}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  clearBooking();
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="rounded-xl border border-[#dbcfb4] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#5e5039] transition-all hover:-translate-y-0.5 hover:border-[#c9803d] hover:bg-[#f9efdd] hover:text-[#915826]"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-xl border border-[#dbcfb4] bg-[#fcf7eb] px-4 py-2.5 text-sm font-black text-[#5e5039] transition-all hover:-translate-y-0.5 hover:border-[#c9803d] hover:bg-[#f9efdd] hover:text-[#915826]"
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
