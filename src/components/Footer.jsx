function Footer() {
  return (
    <footer id="bookings" className="border-t border-[#e5dcc5] bg-[#f2ebd8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="text-lg font-black text-[#483e2d]">CINEBOOK</span>
          </div>
          <p className="mt-2 text-base text-[#776d57]">
            Your seat. Your movie. Your experience.
          </p>
        </div>
        <p className="text-sm font-medium text-[#7e715b]">
          © 2026 CineBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
