import { makeTicketUrl } from "../utils/ticketUrl";

test("builds the correct absolute ticket URL for a deployed subpath", () => {
  expect(makeTicketUrl("CB123", "/Movie-Booking/", "https://cinema.example"))
    .toBe("https://cinema.example/Movie-Booking/ticket/CB123");
});

test("builds a root ticket URL and safely encodes the booking ID", () => {
  expect(makeTicketUrl("CB/123", "/", "https://cinema.example"))
    .toBe("https://cinema.example/ticket/CB%2F123");
});

test("rejects missing booking IDs and cross-origin app bases", () => {
  expect(() => makeTicketUrl("", "/Movie-Booking/", "https://cinema.example")).toThrow(/booking ID/i);
  expect(() => makeTicketUrl("CB123", "https://other.example/", "https://cinema.example")).toThrow(/current website origin/i);
});
