import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
const Home = lazy(() => import("./components/Home"));
const Landing = lazy(() => import("./components/Landing"));
const MovieDetail = lazy(() => import("./components/MovieDetail"));
const TheatreList = lazy(() => import("./components/TheatreList"));
const ShowTiming = lazy(() => import("./components/ShowTiming"));
const SeatSelection = lazy(() => import("./components/SeatSelection"));
const BookingSummary = lazy(() => import("./components/BookingSummary"));
const Payment = lazy(() => import("./components/Payment"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Movies = lazy(() => import("./pages/Movies"));
const TicketVerification = lazy(() => import("./pages/TicketVerification"));
import useBooking from "./hooks/useBooking";
import { fetchMovieById } from "./api/movieApi";
import ProtectedRoute from "./auth/ProtectedRoute";
import GuestRoute from "./auth/GuestRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./auth/useAuth";
import { reserveSeats } from "./utils/availability";
import { saveBooking } from "./utils/bookingStore";
import { authorizePayment, createBooking } from "./api/bookingApi";
import { API_ENABLED } from "./api/apiClient";

function HomeRoute() {
  const navigate = useNavigate();
  const { selectMovie } = useBooking();
  return (
    <Home
      onSelectMovie={(movie) => {
        selectMovie(movie);
        navigate(`/movie/${movie.id}`);
      }}
    />
  );
}

function MovieRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectMovie, selectedMovie } = useBooking();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMovie() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieById(id);
        if (!cancelled) setMovie(data ?? null);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load movie");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMovie();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-16 text-center">
        <h1 className="text-3xl font-black text-[#14213d]">Loading movie…</h1>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#f6f8fb] px-5 py-16 text-center">
        <h1 className="text-3xl font-black text-[#14213d]">{error || "Movie not found"}</h1>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mt-7 rounded-xl bg-[#e4572e] px-6 py-3.5 text-base font-black text-white"
        >
          Back to Movies
        </button>
      </main>
    );
  }

  return (
    <MovieDetail
      movie={movie}
      onBack={() => navigate("/movies")}
      onBook={() => {
        // Changing the movie resets theatre, show and seats, so a stale
        // selection can never carry over to a different film.
        if (selectedMovie?.id !== movie.id) selectMovie(movie);
        navigate("/booking/theatre");
      }}
    />
  );
}

function TheatreRoute() {
  const navigate = useNavigate();
  const { selectedMovie } = useBooking();
  if (!selectedMovie) return <Navigate to="/movies" replace />;
  return (
    <TheatreList
      onContinue={() => navigate("/booking/show")}
      onBack={() => navigate(`/movie/${selectedMovie.id}`)}
    />
  );
}

// Booking steps are only reachable once the previous steps are complete.
// This stops someone from typing /booking/seats into the address bar and
// reaching checkout with an incomplete or inconsistent selection.
function RequireBookingStep({ requires, children }) {
  const { selectedMovie, selectedTheatre, selectedShow, selectedSeats } = useBooking();
  const location = useLocation();
  const checks = {
    movie: Boolean(selectedMovie),
    theatre: Boolean(selectedTheatre),
    show: Boolean(selectedShow),
    seats: selectedSeats.length > 0,
  };

  const missing = requires.find((key) => !checks[key]);
  if (missing) {
    const fallback = { movie: "/movies", theatre: "/booking/theatre", show: "/booking/show", seats: "/booking/seats" }[missing];
    if (location.pathname !== fallback) return <Navigate to={fallback} replace />;
  }
  return children;
}

function ShowRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre"]}>
      <ShowTiming onContinue={() => navigate("/booking/seats")} onBack={() => navigate("/booking/theatre")} />
    </RequireBookingStep>
  );
}

function SeatsRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre", "show"]}>
      <SeatSelection onContinue={() => navigate("/booking/summary")} onBack={() => navigate("/booking/show")} />
    </RequireBookingStep>
  );
}

function SummaryRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre", "show", "seats"]}>
      <BookingSummary onContinue={() => navigate("/checkout")} onBack={() => navigate("/booking/seats")} />
    </RequireBookingStep>
  );
}

function CheckoutRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const booking = useBooking();
  const { clearBooking } = booking;

  const handleConfirm = useCallback(async () => {
    const { selectedMovie, selectedTheatre, selectedShow, selectedSeats, customer, payment, totalAmount } = booking;

    if (!selectedMovie || !selectedTheatre || !selectedShow || !selectedSeats.length) {
      navigate("/booking/theatre", { replace: true });
      throw new Error("Incomplete selection");
    }

    // Seats are re-validated at confirmation time because another booking may
    // have taken them since the seat map was rendered.
    if (!API_ENABLED) {
      const reservation = reserveSeats(selectedMovie, selectedTheatre, selectedShow, selectedSeats);
      if (!reservation.success) {
        navigate("/booking/seats", { replace: true });
        throw new Error(`Seats ${reservation.conflicts.join(", ")} are no longer available.`);
      }
    }

    let ticket = {
      bookingId: `CB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      movieId: selectedMovie.id,
      movie: selectedMovie.title,
      theatre: selectedTheatre.name,
      show: selectedShow.time,
      seats: selectedSeats,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      amount: totalAmount,
      paymentMethod: payment.method,
      status: "paid",
      paymentReference: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      bookedAt: new Date().toISOString(),
    };

    if (API_ENABLED) {
      // The API needs a booking ID to authorize payment. Create the pending
      // booking first, then let the payment endpoint mark it paid.
      const savedTicket = await createBooking(ticket);
      const paymentResult = await authorizePayment({ bookingId: savedTicket.bookingId });
      ticket = {
        ...savedTicket,
        status: paymentResult.status === "paid" ? "paid" : savedTicket.status,
        paymentReference: paymentResult.reference,
        paidAt: paymentResult.paidAt,
      };
    } else if (!saveBooking(user.email, ticket)) {
      throw new Error("Could not save your booking. Please try again.");
    }

    clearBooking();
    navigate("/bookings", { replace: true, state: { newBookingId: ticket.bookingId } });
  }, [booking, clearBooking, navigate, user.email]);

  return (
    <RequireBookingStep requires={["movie", "theatre", "show", "seats"]}>
      <Payment onConfirm={handleConfirm} onBack={() => navigate("/booking/summary")} />
    </RequireBookingStep>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#14213d]">
      <Header />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-black text-[#14213d]">Page not found</h1>
      <p className="mt-3 text-base text-[#667085]">The page you are looking for does not exist.</p>
    </main>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<main className="flex min-h-[50vh] items-center justify-center bg-[#f6f8fb] p-8" role="status" aria-live="polite"><p className="text-lg font-bold text-[#667085]">Loading page…</p></main>}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ticket/:id" element={<TicketVerification />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/home" element={<HomeRoute />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieRoute />} />

          <Route path="/booking">
            <Route index element={<Navigate to="/booking/theatre" replace />} />
            <Route path="theatre" element={<TheatreRoute />} />
            <Route path="show" element={<ShowRoute />} />
            <Route path="seats" element={<SeatsRoute />} />
            <Route path="summary" element={<SummaryRoute />} />
          </Route>

          <Route path="/checkout" element={<CheckoutRoute />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter basename="/Movie-Booking">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
