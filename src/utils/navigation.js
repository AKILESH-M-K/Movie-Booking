// Only same-app, relative paths may be used as a post-login destination.
// This blocks open redirects through router navigation state.
export function safeReturnPath(value) {
  if (typeof value !== "string") return "/home";
  if (!value.startsWith("/") || value.startsWith("//")) return "/home";
  if (value.startsWith("/login") || value.startsWith("/signup")) return "/home";
  return value;
}
