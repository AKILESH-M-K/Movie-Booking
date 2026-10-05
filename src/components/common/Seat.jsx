function Seat({ seat, selected = false, onClick, disabled = false, booked = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(seat.id)}
      title={booked ? `${seat.id} - Already booked` : `${seat.id} - ${seat.type} seat`}
      className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xs font-black transition-all duration-200 sm:h-12 sm:w-12 ${
        booked
          ? "cursor-not-allowed border-[#514b41] bg-[#514b41] text-[#e4ded4] line-through"
          : selected
            ? "-translate-y-0.5 border-[#a4652a] bg-[#a4652a] text-white shadow-md shadow-[#a4652a]/20"
            : seat.type === "Premium"
              ? "border-[#ce9d68] bg-[#faebda] text-[#915826] hover:-translate-y-0.5 hover:bg-[#f4dec7]"
              : "border-[#ddd4bc] bg-[#fefbf1] text-[#685b47] hover:-translate-y-0.5 hover:border-[#a4652a] hover:bg-[#faeede]"
      }`}
    >
      {seat.id}
    </button>
  );
}

export default Seat;
