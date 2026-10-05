const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export function sanitizeText(value, maxLength = 100) {
  return String(value ?? "")
    .replace(CONTROL_CHARS, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(value) {
  return sanitizeText(value, 254).toLowerCase();
}

export function sanitizeName(value) {
  return sanitizeText(value, 60).replace(/\s{2,}/g, " ");
}

export function sanitizePhone(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

export function sanitizeSearch(value) {
  return String(value ?? "")
    .replace(CONTROL_CHARS, "")
    .slice(0, 80);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isValidPhone(value) {
  return /^\d{10}$/.test(value);
}

export function isStrongEnoughPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export function sanitizeUpi(value) {
  return sanitizeText(value, 100).toLowerCase().replace(/\s/g, "");
}

export function isValidUpi(value) {
  return /^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(value);
}

export function sanitizeCardNumber(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 19);
}

export function isValidCardNumber(value) {
  if (!/^\d{13,19}$/.test(value)) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = Number(value[i]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

export function sanitizeExpiry(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(`20${match[2]}`);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function sanitizeCvv(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 4);
}

export function isValidCvv(value) {
  return /^\d{3,4}$/.test(value);
}
