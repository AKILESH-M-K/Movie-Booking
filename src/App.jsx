import { useCallback, useEffect, useState } from "react";
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
import Home from "./components/Home";
import Landing from "./components/Landing";
import MovieDetail from "./components/MovieDetail";
import TheatreList from "./components/TheatreList";
import ShowTiming from "./components/ShowTiming";
import SeatSelection from "./components/SeatSelection";
import BookingSummary from "./components/BookingSummary";
import Payment from "./components/Payment";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import Movies from "./pages/Movies";
import useBooking from "./hooks/useBooking";
import { fetchMovieById } from "./api/movieApi";
import ProtectedRoute from "./auth/ProtectedRoute";
import GuestRoute from "./auth/GuestRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./auth/AuthContext";
import { reserveSeats } from "./utils/availability";
import { saveBooking } from "./utils/bookingStore";

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
      <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-16 text-center">
        <h1 className="text-3xl font-black text-[#3d3324]">Loading movie…</h1>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#f9f4e4] px-5 py-16 text-center">
        <h1 className="text-3xl font-black text-[#3d3324]">{error || "Movie not found"}</h1>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mt-7 rounded-xl bg-[#a4652a] px-6 py-3.5 text-base font-black text-white"
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
    const reservation = reserveSeats(selectedMovie, selectedTheatre, selectedShow, selectedSeats);
    if (!reservation.success) {
      navigate("/booking/seats", { replace: true });
      throw new Error(`Seats ${reservation.conflicts.join(", ")} are no longer available.`);
    }

    const ticket = {
      bookingId: `CB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      movie: selectedMovie.title,
      theatre: selectedTheatre.name,
      show: selectedShow.time,
      seats: selectedSeats,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      amount: totalAmount,
      paymentMethod: payment.method,
      bookedAt: new Date().toISOString(),
    };

    if (!saveBooking(user.email, ticket)) {
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
    <div className="min-h-screen bg-[#f9f4e4] text-[#3d3324]">
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
      <h1 className="text-3xl font-black text-[#3d3324]">Page not found</h1>
      <p className="mt-3 text-base text-[#736956]">The page you are looking for does not exist.</p>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
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
