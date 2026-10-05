import { Link } from "react-router-dom";

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
    <main className="min-h-screen bg-[#f9f4e4] text-[#3d3324]">
      <section className="relative overflow-hidden bg-[#f2ebd8]">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#c9803d]/10 blur-3xl" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#6d7650]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a4652a] text-2xl shadow-md">
                🎬
              </div>
              <div>
                <p className="text-xl font-black tracking-wide">CINEBOOK</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d8d6f]">
                  Movie Booking
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="rounded-xl border border-[#dbcfb4] bg-[#fffcf5] px-5 py-3 text-sm font-black text-[#5e5039] transition hover:-translate-y-0.5 hover:border-[#c9803d] hover:bg-[#f9efdd]"
            >
              Sign In
            </Link>
          </div>

          <div className="mx-auto mt-20 max-w-4xl text-center lg:mt-24">
            <span className="inline-flex rounded-full border border-[#ce9d68]/40 bg-[#fffcf5]/80 px-4 py-2 text-sm font-black tracking-wide text-[#9b5d28] shadow-sm">
              YOUR COMPLETE MOVIE NIGHT, IN ONE PLACE
            </span>
            <h1 className="mt-7 text-5xl font-black tracking-tight sm:text-7xl">
              Discover. Choose. <span className="text-[#b16b2b]">Book.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#6a604d] sm:text-xl">
              CineBook brings movie discovery, theatre availability, show
              timings, seat selection, secure checkout and digital tickets into
              one simple booking flow.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/login"
                className="rounded-xl bg-[#a4652a] px-7 py-4 text-base font-black text-white shadow-lg shadow-[#a4652a]/20 transition hover:-translate-y-1 hover:bg-[#875022]"
              >
                Login to Start Booking →
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-[#dbcfb4] bg-[#fffcf5] px-7 py-4 text-base font-black text-[#5e5039] transition hover:-translate-y-1 hover:border-[#c9803d]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#9a7547]">
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
              className="rounded-3xl border border-[#eae3cc] bg-[#fffef7] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faeede] text-2xl">
                {icon}
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-base leading-7 text-[#736956]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#eae3cc] bg-[#fffcf5]">
        <div className="mx-auto max-w-5xl px-5 py-14 text-center lg:px-8">
          <h2 className="text-3xl font-black">Ready for your next show?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#736956]">
            Sign in first. Then explore movies, choose an available theatre and
            show, pick open seats and receive your digital ticket.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex rounded-xl bg-[#a4652a] px-7 py-4 text-base font-black text-white transition hover:-translate-y-1 hover:bg-[#875022]"
          >
            Enter CineBook →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Landing;
