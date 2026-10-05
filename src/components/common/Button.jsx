function Button({ children, type = "button", variant = "primary", disabled = false, onClick, className = "" }) {
  const styles = {
    primary: "bg-[#a4652a] text-white hover:bg-[#875022] hover:-translate-y-0.5 hover:shadow-lg",
    secondary: "border border-[#dbcfb4] bg-[#fcf7eb] text-[#5e5039] hover:border-[#c9803d] hover:bg-[#f9efdd]",
    olive: "bg-[#6d7650] text-white hover:bg-[#59613f] hover:-translate-y-0.5 hover:shadow-lg",
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
