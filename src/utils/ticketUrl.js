export function makeTicketUrl(bookingId, baseUrl = "/Movie-Booking/", origin = window.location.origin) {
  if (!bookingId) throw new Error("A booking ID is required to build the ticket URL.");

  const siteOrigin = new URL(origin);
  const appBase = new URL(baseUrl || "/", siteOrigin);
  if (appBase.origin !== siteOrigin.origin) {
    throw new Error("The ticket URL base must use the current website origin.");
  }

  const basePath = appBase.pathname.replace(/\/+$/, "");
  appBase.pathname = `${basePath}/ticket/${encodeURIComponent(String(bookingId))}`;
  appBase.search = "";
  appBase.hash = "";
  return appBase.toString();
}
