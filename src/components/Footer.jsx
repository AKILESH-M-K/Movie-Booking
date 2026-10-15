function Footer() {
  return (
    <footer id="bookings" className="border-t border-canvas-muted bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="font-serif text-lg font-bold tracking-tight text-ink-primary">CINEBOOK</span>
          </div>
          <p className="mt-2 font-sans text-sm text-ink-secondary">
            Your seat. Your movie. Your experience.
          </p>
        </div>
        <p className="font-sans text-xs font-medium text-ink-tertiary">
          © 2026 CineBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
