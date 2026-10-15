function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
}) {
  const styles = {
    primary:
      "bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl shadow-cozy transition-all active:scale-[0.99]",
    secondary:
      "border border-canvas-muted bg-surface text-ink-primary hover:bg-canvas font-semibold rounded-xl shadow-cozy transition-all active:scale-[0.99]",
    olive:
      "border border-brand/20 bg-brand-light text-brand hover:bg-brand/15 font-semibold rounded-xl shadow-cozy transition-all active:scale-[0.99]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-3.5 text-base font-sans transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant] || styles.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
