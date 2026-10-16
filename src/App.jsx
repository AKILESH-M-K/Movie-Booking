import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
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
      <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-16 text-center font-sans">
        <h1 className="font-serif text-3xl font-bold text-ink-primary">Loading movie…</h1>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-canvas px-5 py-16 text-center font-sans">
        <h1 className="font-serif text-3xl font-bold text-ink-primary">
          {error || "Movie not found"}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mt-7 rounded-xl bg-brand px-6 py-3.5 font-sans text-base font-semibold text-white shadow-cozy transition-all hover:bg-brand-hover active:scale-[0.99]"
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

function RequireBookingStep({ requires, children }) {
  const { selectedMovie, selectedTheatre, selectedShow, selectedSeats } =
    useBooking();
  const location = useLocation();
  const checks = {
    movie: Boolean(selectedMovie),
    theatre: Boolean(selectedTheatre),
    show: Boolean(selectedShow),
    seats: selectedSeats.length > 0,
  };

  const missing = requires.find((key) => !checks[key]);
  if (missing) {
    const fallback = {
      movie: "/movies",
      theatre: "/booking/theatre",
      show: "/booking/show",
      seats: "/booking/seats",
    }[missing];
    if (location.pathname !== fallback)
      return <Navigate to={fallback} replace />;
  }
  return children;
}

function ShowRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre"]}>
      <ShowTiming
        onContinue={() => navigate("/booking/seats")}
        onBack={() => navigate("/booking/theatre")}
      />
    </RequireBookingStep>
  );
}

function SeatsRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre", "show"]}>
      <SeatSelection
        onContinue={() => navigate("/booking/summary")}
        onBack={() => navigate("/booking/show")}
      />
    </RequireBookingStep>
  );
}

function SummaryRoute() {
  const navigate = useNavigate();
  return (
    <RequireBookingStep requires={["movie", "theatre", "show", "seats"]}>
      <BookingSummary
        onContinue={() => navigate("/checkout")}
        onBack={() => navigate("/booking/seats")}
      />
    </RequireBookingStep>
  );
}

function CheckoutRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const booking = useBooking();
  const { clearBooking } = booking;
  const idempotencyKeyRef = useRef(null);

  const handleConfirm = useCallback(async () => {
    const {
      selectedMovie,
      selectedTheatre,
      selectedShow,
      selectedDate,
      selectedSeats,
    } = booking;

    if (
      !selectedMovie ||
      !selectedTheatre ||
      !selectedShow ||
      !selectedSeats.length
    ) {
      navigate("/booking/theatre", { replace: true });
      return;
    }

    if (!API_ENABLED) {
      throw new Error("The booking API is not configured. No ticket was issued.");
    }
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = globalThis.crypto?.randomUUID?.() || `cinebook-${Date.now()}-${selectedMovie.id}`;
    }

    const savedTicket = await createBooking({
      movieId: selectedMovie.id,
      theatre: selectedTheatre.name,
      show: selectedShow.time,
      showDate: selectedDate,
      seats: [...new Set(selectedSeats)],
      paymentMethod: "Demo confirmation",
    }, idempotencyKeyRef.current);
    const receipt = await authorizePayment({ bookingId: savedTicket.bookingId });
    const demoConfirmed = receipt?.status === "demo_confirmed"
      && receipt.paymentMode === "demo"
      && receipt.bookingId === savedTicket.bookingId
      && typeof receipt.reference === "string"
      && receipt.reference.startsWith("DEMO-")
      && Boolean(receipt.demoConfirmedAt);
    const providerVerified = receipt?.status === "paid"
      && receipt.bookingId === savedTicket.bookingId
      && Boolean(receipt.reference && receipt.paymentProvider && receipt.providerTransactionId && receipt.paymentVerifiedAt);
    if (!demoConfirmed && !providerVerified) {
      throw new Error("No valid booking confirmation was received. Please try again.");
    }

    const ticket = {
      ...savedTicket,
      bookingId: receipt.bookingId,
      showDate: savedTicket.showDate || selectedDate,
      movieImage: savedTicket.movieImage || selectedMovie.image,
      format: savedTicket.format || selectedShow.format,
      status: demoConfirmed ? "demo_confirmed" : "paid",
      paymentMode: demoConfirmed ? "demo" : "provider",
      paymentReference: receipt.reference,
      ...(demoConfirmed
        ? { demoReference: receipt.reference, demoConfirmedAt: receipt.demoConfirmedAt }
        : {
            paymentProvider: receipt.paymentProvider,
            providerTransactionId: receipt.providerTransactionId,
            paymentVerifiedAt: receipt.paymentVerifiedAt,
            paidAt: receipt.paidAt,
          }),
    };
    saveBooking(user?.email || ticket.customer?.email, ticket);
    idempotencyKeyRef.current = null;
    clearBooking();
    navigate("/bookings", { replace: true, state: { newBookingId: ticket.bookingId } });
  }, [booking, clearBooking, navigate, user]);

  return (
    <RequireBookingStep requires={["movie", "theatre", "show", "seats"]}>
      <Payment
        onConfirm={handleConfirm}
        onBack={() => navigate("/booking/summary")}
      />
    </RequireBookingStep>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink-primary font-sans">
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
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center font-sans">
      <h1 className="font-serif text-3xl font-bold text-ink-primary">Page not found</h1>
      <p className="mt-3 text-base text-ink-secondary">
        The page you are looking for does not exist.
      </p>
    </main>
  );
}

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-[50vh] items-center justify-center bg-canvas p-8 font-sans"
          role="status"
          aria-live="polite"
        >
          <p className="text-lg font-medium text-ink-secondary">Loading page…</p>
        </main>
      }
    >
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
              <Route
                index
                element={<Navigate to="/booking/theatre" replace />}
              />
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
