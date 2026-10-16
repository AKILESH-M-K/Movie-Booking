# CineBook deployment handoff

## Verified project status

- `npm ci` completed from the lockfile.
- `npm test -- --watchAll=false`: **14 suites and 50 tests passed**.
- `npm run lint`: passed.
- `npm run build`: passed; Vite builds under `/Movie-Booking/` for GitHub Pages.
- The backend exits at startup if `NODE_ENV=production` and `PAYMENT_MODE=demo`.
- There is **no payment-provider integration**. A production checkout is not ready; do not configure provider mode as if it charged customers.

## Backend on Render

Create a **Web Service** from the repository:

- Build command: `npm ci`
- Start command: `npm run server`
- Set `NODE_ENV=production`
- Set `PAYMENT_MODE=provider` (this only avoids the demo-mode production block; it does not add a payment provider)
- Set `JWT_SECRET` to a newly generated random value of at least 32 characters. Since an earlier screenshot exposed the previous secret, treat it as compromised and do not reuse it. Generate a replacement locally with `openssl rand -base64 48`; keep it only in Render's secret environment settings.
- Set `CLIENT_ORIGIN=https://akilesh-m-k.github.io` (optionally append `,http://localhost:5173` only if local browser testing against the production service is intentional).
- Render supplies `PORT`; the server uses it automatically.

### Important storage limitation

The API currently persists data in a local JSON file (`db.json`), not a managed database. Render's ordinary service filesystem is ephemeral; bookings/accounts can be lost on redeploy/restart unless a persistent disk is configured. If using a Render disk, set `DATABASE_PATH` to a file path on that mounted disk. For real production use, migrate to a managed database and add backups before relying on this service.

## GitHub Pages frontend

After the Render service is live, create an ignored local `.env.production.local` file in the project root with:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

Then run:

```sh
npm run deploy
```

The API URL is compiled into the frontend bundle and is public, so it must not contain credentials. `VITE_API_URL` must be an HTTPS URL for production.

## Security and package hygiene

The uploaded ZIP included local `.env.production.local` and `server/.env` files. They were removed from the sanitized copy; their values were not copied into this handoff. Keep all secrets out of source control and ZIPs. The checked-in `.gitignore` excludes local env files and database files.

Dependency installation reported **19 moderate audit findings**. Review with `npm audit` and assess updates separately; do not apply broad `--force` upgrades without testing.
