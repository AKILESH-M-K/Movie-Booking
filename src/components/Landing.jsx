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
    <main className="min-h-screen bg-canvas text-ink-primary font-sans">
      <section className="relative overflow-hidden border-b border-canvas-muted bg-surface/60">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-amber/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-2xl text-white shadow-cozy">
                🎬
              </div>
              <div>
                <p className="font-serif text-xl font-bold tracking-tight text-ink-primary">CINEBOOK</p>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-ink-tertiary">
                  Cinema Lounge
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row">
              <InstallPWA />
              <Link
                to="/login"
                className="rounded-xl border border-canvas-muted bg-surface px-5 py-2.5 font-sans text-sm font-semibold text-ink-primary shadow-cozy transition hover:bg-canvas hover:text-brand active:scale-[0.99]"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-4xl text-center lg:mt-24">
            <span className="inline-flex rounded-full border border-brand/20 bg-brand-light/70 px-4 py-1.5 font-sans text-xs font-semibold tracking-wider text-brand shadow-sm">
              YOUR COMPLETE MOVIE NIGHT, IN ONE PLACE
            </span>
            <h1 className="mt-7 font-serif text-5xl font-bold uppercase tracking-tight text-ink-primary sm:text-7xl">
              Discover. Choose.
              <span className="font-script ml-3 inline-block text-6xl font-normal normal-case tracking-normal text-brand sm:text-8xl">
                Book.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl font-sans text-lg leading-8 text-ink-secondary sm:text-xl">
              CineBook brings movie discovery, theatre availability, show
              timings, seat selection, secure checkout and digital tickets into
              one warm, boutique cinema experience.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/login"
                className="rounded-xl bg-brand px-7 py-4 font-sans text-base font-semibold text-white shadow-cozy transition hover:bg-brand-hover active:scale-[0.99]"
              >
                Login to Start Booking →
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-canvas-muted bg-surface px-7 py-4 font-sans text-base font-semibold text-ink-primary shadow-cozy transition hover:bg-canvas active:scale-[0.99]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-secondary">
            Everything in one flow
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
            What CineBook gives you
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([icon, title, description]) => (
            <article
              key={title}
              className="rounded-2xl border border-canvas-muted bg-surface p-6 shadow-cozy transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-canvas-muted bg-canvas text-2xl shadow-sm">
                {icon}
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold text-ink-primary">{title}</h3>
              <p className="mt-3 font-sans text-base leading-7 text-ink-secondary">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-canvas-muted bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-14 text-center lg:px-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink-primary">Ready for your next show?</h2>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-base leading-7 text-ink-secondary">
            Sign in first. Then explore movies, choose an available theatre and
            show, pick open seats and receive your digital ticket.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex rounded-xl bg-brand px-7 py-4 font-sans text-base font-semibold text-white shadow-cozy transition hover:bg-brand-hover active:scale-[0.99]"
          >
            Enter CineBook →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Landing;
