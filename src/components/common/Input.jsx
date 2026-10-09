function Input({ label, error, id, type = "text", value, onChange, placeholder, required = false, inputMode, readOnly = false }) {
  return (
    <div>
      {label && <label htmlFor={id} className="mb-2 block text-base font-bold text-[#534632]">{label}</label>}
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
        className={`w-full rounded-xl border bg-[#fefbf1] px-4 py-3.5 text-base text-[#14213d] outline-none transition focus:ring-4 placeholder:text-[#b0a48c] ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-[#e3d8c0] focus:border-[#e4572e] focus:ring-[#e4572e]/10"}`}
      />
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
