import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
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
import useMovies from "./hooks/useMovies";
import { fetchMovieById } from "./api/movieApi";
import ProtectedRoute from "./auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./auth/AuthContext";
import { reserveSeats } from "./utils/availability";

function HomeRoute() {
  const navigate = useNavigate();
  return <Home onSelectMovie={(movie) => navigate(`/movie/${movie.id}`)} />;
}

function MovieRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { chooseMovie } = useMovies();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the individual movie's details dynamically from the REST API.
  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (err) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
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
        <h1 className="text-3xl font-black text-[#3d3324]">
          {error || "Movie not found"}
        </h1>
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
        chooseMovie(movie);
        navigate("/booking/theatre");
      }}
    />
  );
}

function TheatreRoute() {
  const navigate = useNavigate();
  return (
    <TheatreList
      onContinue={() => navigate("/booking/show")}
      onBack={() => navigate("/movies")}
    />
  );
}

function ShowRoute() {
  const navigate = useNavigate();
  return (
    <ShowTiming
      onContinue={() => navigate("/booking/seats")}
      onBack={() => navigate("/booking/theatre")}
    />
  );
}

function SeatsRoute() {
  const navigate = useNavigate();
  return (
    <SeatSelection
      onContinue={() => navigate("/booking/summary")}
      onBack={() => navigate("/booking/show")}
    />
  );
}

function SummaryRoute() {
  const navigate = useNavigate();
  return (
    <BookingSummary
      onContinue={() => navigate("/checkout")}
      onBack={() => navigate("/booking/seats")}
    />
  );
}

function CheckoutRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    customer,
    payment,
    totalAmount,
    clearBooking,
  } = useBooking();

  const handleBookingComplete = useCallback(() => {
    if (
      !selectedMovie ||
      !selectedTheatre ||
      !selectedShow ||
      !selectedSeats.length
    ) {
      alert("Please complete movie, theatre, show, and seat selection first.");
      navigate("/booking/theatre");
      return;
    }

    const reservation = reserveSeats(
      selectedMovie,
      selectedTheatre,
      selectedShow,
      selectedSeats,
    );
    if (!reservation.success) {
      alert(
        `These seats are no longer available: ${reservation.conflicts.join(", ")}. Please return to seat selection.`,
      );
      navigate("/booking/seats");
      return;
    }

    const booking = {
      bookingId: `CB${Date.now()}`,
      movie: selectedMovie.title,
      theatre: selectedTheatre.name,
      show: selectedShow.time,
      seats: selectedSeats,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      amount: totalAmount,
      paymentMethod: payment.method,
      bookedAt: new Date().toISOString(),
    };

    const key = `cinebookBooking:${user.email}`;
    localStorage.setItem(key, JSON.stringify(booking));
    alert(`Booking confirmed successfully!\nBooking ID: ${booking.bookingId}`);
    clearBooking();
    navigate("/bookings");
  }, [
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    customer,
    totalAmount,
    payment.method,
    clearBooking,
    navigate,
    user.email,
  ]);

  return (
    <Payment
      onConfirm={handleBookingComplete}
      onBack={() => navigate("/booking/summary")}
    />
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
          <Route path="/payment" element={<CheckoutRoute />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/theatres" element={<TheatreRoute />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
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
