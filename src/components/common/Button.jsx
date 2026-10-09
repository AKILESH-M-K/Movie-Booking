function Button({ children, type = "button", variant = "primary", disabled = false, onClick, className = "" }) {
  const styles = {
    primary: "bg-[#e4572e] text-white hover:bg-[#c94423] hover:-translate-y-0.5 hover:shadow-lg",
    secondary: "border border-[#d0d5dd] bg-[#fcf7eb] text-[#344054] hover:border-[#e4572e] hover:bg-[#fff1ed]",
    olive: "bg-[#2a9d8f] text-white hover:bg-[#59613f] hover:-translate-y-0.5 hover:shadow-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-5 py-3.5 text-base font-black transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
