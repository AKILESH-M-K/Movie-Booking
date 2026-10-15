function Seat({
  seat,
  selected = false,
  onClick,
  onKeyDown,
  disabled = false,
  booked = false,
  price,
}) {
  const stateLabel = booked ? "Booked" : selected ? "Selected" : "Available";
  const label = `Seat ${seat.id}, ${seat.type}${price != null ? `, ₹${price}` : ""}, ${stateLabel}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(seat)}
      aria-label={label}
      aria-pressed={selected}
      data-seat-id={seat.id}
      onKeyDown={(event) => onKeyDown?.(event, seat)}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-bold font-sans transition-all duration-200 sm:h-12 sm:w-12 active:scale-95 ${
        booked
          ? "cursor-not-allowed border-canvas-muted bg-seat-booked line-through text-ink-tertiary opacity-80"
          : selected
            ? "-translate-y-0.5 border-brand bg-brand text-white shadow-cozy ring-2 ring-brand/30"
            : "border-canvas-muted bg-seat-available text-ink-primary hover:bg-seat-hover hover:-translate-y-0.5"
      }`}
    >
      {seat.id}
    </button>
  );
}

export default Seat;
