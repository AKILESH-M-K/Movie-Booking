function Input({
  label,
  error,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  inputMode,
  readOnly = false,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium font-sans text-ink-primary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        readOnly={readOnly}
        className={`w-full rounded-xl border bg-surface px-4 py-3.5 text-base font-sans text-ink-primary outline-none transition focus:ring-4 placeholder:text-ink-tertiary ${
          error
            ? "border-brand focus:border-brand focus:ring-brand/15"
            : "border-canvas-muted focus:border-brand focus:ring-brand/10"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-xs font-semibold font-sans text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
