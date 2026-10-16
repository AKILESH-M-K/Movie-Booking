# CineBook — demo checkout update and setup

**Demo checkout now works in development/test mode.** The booking server returns a clearly labeled demo confirmation and creates a preview ticket/QR. The booking is saved as `demo_confirmed`, never `paid`; **no real money is collected**. Production startup refuses `PAYMENT_MODE=demo`.

## What changed

- Checkout offers a single **Confirm demo booking** action. It does not request a UPI ID, contact a bank, or charge money. The displayed rupee amount is informational only.
- The server issues an idempotent `DEMO-…` reference and saves `paymentMode: "demo"`, `demoConfirmedAt`, and `status: "demo_confirmed"`. It does not fabricate provider, transaction, or paid-at fields.
- Demo bookings appear in booking history and reserve their seats. Scanning the QR opens the public pink ticket page (`/Movie-Booking/ticket/:bookingId`) with the movie poster, screening details, and booked seats. Demo tickets clearly say **no payment taken** and **not valid for real theatre admission**. Cancelling a demo booking creates no refund claim.
- `PAYMENT_MODE=demo` is the local example configuration and is the default for non-production server runs. In production, the server refuses demo mode. `PAYMENT_MODE=provider` stays fail-closed until a genuine provider and verified server callback are integrated.
- The public ticket page is styled pink and shows the movie poster, screening details, and booked seats. GitHub Pages' deep-link fallback restores `/Movie-Booking/ticket/:bookingId` when a QR is opened directly. Existing protections remain: date-bound server inventory, show/theatre matching, booking ownership, privacy-safe server ticket verification, and no customer payload dumps in browser logs. The QR contains only the ticket-page URL; that page retrieves admission details from the server.

## Local setup

1. Run `npm ci`.
2. Copy `server/.env.example` to `server/.env` and set a random `JWT_SECRET` of at least 32 characters. The server intentionally refuses to start without it.
3. Keep `NODE_ENV=development` and `PAYMENT_MODE=demo`. In the project root, set `VITE_API_URL=http://localhost:4000` in `.env` (copy/edit the root `.env.example`).
4. Run `npm run dev:all` and book a ticket. The QR opens the app's ticket page. For scanning from another device, deploy the website and configure a publicly reachable API URL; a local `localhost` QR is only reachable on the same machine. The resulting demo ticket is for preview/testing only—not a paid booking and not valid for actual admission.
5. Before accepting real payments, integrate a gateway and verify its signed server-side transaction/webhook. Do not manually change a demo booking to `paid`.

For production, configure an exact HTTPS `CLIENT_ORIGIN`, the HTTPS API URL, a private runtime database path, and a real provider integration. Until that integration exists, provider mode returns a clear unavailable response.

## Validation

- `npm test -- --runInBand`: **14 suites, 50 tests passed**.
- `npm run lint`, `npm run build`, `node --check server/index.js`, and `git diff --check`: **passed**.
- Isolated server integration checks passed for demo receipt idempotency, absence of real payment-proof fields, demo ticket verification, seat occupancy, cancellation without a refund, and production rejection of demo mode. Checks used only a temporary synthetic database.

## Data note and remaining production limits

The downloadable archive excludes the runtime `db.json`, environment secrets, Git metadata, dependencies, and build output; its example seed has no users or bookings. Removing a tracked database from this local working tree does not erase earlier Git history or remote copies. If its account/contact records were real, rotate affected credentials and separately review the remote history.

The JSON store and in-process lock are intended for a single local process. Production should use a transactional database and shared rate limits. Single-use ticket check-in/replay prevention also needs to be implemented before any real venue-admission workflow.
