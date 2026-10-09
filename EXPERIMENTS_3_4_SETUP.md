
# CineBook — Experiment 3 and 4 setup

This update adds a local Express REST API, persistent JSON storage, CRUD booking endpoints, and JWT bearer-token authentication. It keeps the existing React UI and Redux booking flow.

## Requirements
- Node.js 20+ (use a currently supported Node LTS version)
- npm

## 1. Install dependencies
From the project root:
```bash
npm install
```

## 2. Configure the API secret
Copy `server/.env.example` to `server/.env`. Replace `JWT_SECRET` with a random secret of at least 32 characters. Do not commit `server/.env`.
Example generation command:
```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## 3. Run frontend and backend
Open two terminals in the project root.

Terminal 1:
```bash
npm run server
```
API health check: `http://localhost:4000/health`

Terminal 2:
```bash
npm run dev
```
Open the Vite URL printed in the terminal. For this local API mode, do not use GitHub Pages; a static GitHub Pages deployment cannot host this Node backend.

## Experiment 3 — API routes
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/movies` | Retrieve movie list |
| GET | `/movies/:id` | Retrieve a movie |
| GET | `/theatres` | Retrieve theatres |
| GET | `/shows` | Retrieve show timings |
| POST | `/bookings` | Create a booking (Bearer token required) |
| GET | `/bookings` | View only the signed-in user's booking history (token required) |
| PATCH | `/bookings/:id` | Update customer details (token required) |
| PUT | `/bookings/:id` | Replace customer details (token required) |
| DELETE | `/bookings/:id` | Cancel a booking (token required; retained as cancelled for history) |

The Movies and Show Timing screens show loading/error states. My Bookings includes retry, customer-detail editing, and cancellation actions. The API stores data in `db.json`; back it up before resetting it.

## Experiment 4 — auth/token routes
- `POST /auth/signup` creates an account and stores a bcrypt password hash.
- `POST /auth/login` returns a signed JWT access token (30-minute expiry).
- The frontend stores the access token in `sessionStorage` and sends `Authorization: Bearer <token>` automatically.
- `GET /auth/me` and booking/payment endpoints require a valid token.
- HTTP 401 responses remove the token/session and send the user back through the protected-route login flow.
- `POST /payments/authorize` is a protected **classroom simulation** only; it does not charge money or process real card details.

## Quick Postman test
1. `POST http://localhost:4000/auth/signup` with JSON:
   `{"name":"Demo User","email":"demo@example.com","phone":"9876543210","password":"DemoPass123"}`
2. `POST http://localhost:4000/auth/login` with the same email/password. Copy `token`.
3. For protected routes, add header `Authorization: Bearer YOUR_TOKEN`.
4. `GET /bookings` should return `[]` for a new account.
5. To test authorization, call `GET /bookings` without the header: it should return `401`.

## Important project/demo limits
This is a teaching/demo API using a JSON file, not production infrastructure. It demonstrates authentication and per-user authorization, but real deployment should use a database with transactions, rate limiting, HTTPS, refresh-token/session revocation strategy, and a real payment provider. Client-side route protection is only UX; server-side token verification is the actual access control.
