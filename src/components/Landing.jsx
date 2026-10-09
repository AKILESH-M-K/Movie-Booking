import { Link } from "react-router-dom";
import InstallPWA from "./InstallPWA";

const features = [
  [
    "🎬",
    "Movie discovery",
    "Browse films, genres, languages and ratings before you book.",
  ],
  [
    "🏢",
    "Live-style theatre availability",
    "Theatre and show availability changes for each movie selection.",
  ],
  [
    "💺",
    "Interactive seat selection",
    "See available and already-booked seats before confirming.",
  ],
  [
    "🎟️",
    "Digital ticket",
    "Get a booking ID, seat numbers and a scannable QR ticket after payment.",
  ],
];

function Landing() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#14213d]">
      <section className="relative overflow-hidden bg-[#eef2f7]">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#e4572e]/10 blur-3xl" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#2a9d8f]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4572e] text-2xl shadow-md">
                🎬
              </div>
              <div>
                <p className="text-xl font-black tracking-wide">CINEBOOK</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d8d6f]">
                  Movie Booking
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row">
              <InstallPWA />
              <Link
                to="/login"
                className="rounded-xl border border-[#d0d5dd] bg-[#ffffff] px-5 py-3 text-sm font-black text-[#344054] transition hover:-translate-y-0.5 hover:border-[#e4572e] hover:bg-[#fff1ed]"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-4xl text-center lg:mt-24">
            <span className="inline-flex rounded-full border border-[#f08a70]/40 bg-[#ffffff]/80 px-4 py-2 text-sm font-black tracking-wide text-[#9b5d28] shadow-sm">
              YOUR COMPLETE MOVIE NIGHT, IN ONE PLACE
            </span>
            <h1 className="mt-7 text-5xl font-black uppercase tracking-tight sm:text-7xl">
              Discover. Choose.
              <span className="font-script ml-2 inline-block text-6xl font-normal normal-case tracking-normal text-[#e4572e] sm:text-8xl">
                Book.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#667085] sm:text-xl">
              CineBook brings movie discovery, theatre availability, show
              timings, seat selection, secure checkout and digital tickets into
              one simple booking flow.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/login"
                className="rounded-xl bg-[#e4572e] px-7 py-4 text-base font-black text-white shadow-lg shadow-[#e4572e]/20 transition hover:-translate-y-1 hover:bg-[#c94423]"
              >
                Login to Start Booking →
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-[#d0d5dd] bg-[#ffffff] px-7 py-4 text-base font-black text-[#344054] transition hover:-translate-y-1 hover:border-[#e4572e]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#667085]">
            Everything in one flow
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            What CineBook gives you
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([icon, title, description]) => (
            <article
              key={title}
              className="rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ed] text-2xl">
                {icon}
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-base leading-7 text-[#667085]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e4e7ec] bg-[#ffffff]">
        <div className="mx-auto max-w-5xl px-5 py-14 text-center lg:px-8">
          <h2 className="text-3xl font-black">Ready for your next show?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#667085]">
            Sign in first. Then explore movies, choose an available theatre and
            show, pick open seats and receive your digital ticket.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex rounded-xl bg-[#e4572e] px-7 py-4 text-base font-black text-white transition hover:-translate-y-1 hover:bg-[#c94423]"
          >
            Enter CineBook →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Landing;
