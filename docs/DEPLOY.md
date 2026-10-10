# Deploy on SnapDeploy (free, no card)

The app ships as a Docker image published to GitHub Container Registry by
`.github/workflows/publish-image.yml`. SnapDeploy pulls that public image, so you need no build step there.

- Image: `ghcr.io/alishnis/nasaspace-app:latest` (also tagged `:sha-<short sha>`)
- Port: `3003` (set by `EXPOSE 3003` and `ENV PORT=3003` in the `Dockerfile`)
- Health check: SnapDeploy polls `/`, which returns `200` (the app also has `/health`)

## 1. Publish the image (repo owner, once)

1. Merge to `main`. The workflow runs on pushes that touch the app or `Dockerfile`; you can also start it from **Actions -> Publish image -> Run workflow**.
2. The first run creates the package as **private**. Make it public, otherwise SnapDeploy cannot pull it:
   **Profile -> Packages -> `nasaspace-app` -> Package settings -> Change visibility -> Public**.

## 2. Create the container on SnapDeploy

1. Sign up with GitHub or e-mail (no card on the free tier).
2. Create a new container from a public Docker image: `ghcr.io/alishnis/nasaspace-app:latest`.
3. Set the port to `3003` if it is not detected from the image.
4. Add the environment variables below in the dashboard, then deploy.

## Environment variables

Names only. Set values in the SnapDeploy dashboard, never in the repo. All are optional (defaults are in `.env.example`), but set `JWT_SECRET`.

- `JWT_SECRET`
- `TEMPO_API_KEY`, `TEMPO_API_URL`
- `WEATHER_API_KEY`
- `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `REDIS_HOST`, `REDIS_PORT`
- `PORT` (already `3003` in the image; only change it if you also change the dashboard port)

Notes:

- Use **new, freshly generated keys**. Do not reuse any key that was ever committed or shared; rotate old ones.
- Without `JWT_SECRET` a random secret is generated at every start, so users are logged out after each restart or wake-up.
- `TEMPO_API_KEY`, `TEMPO_API_URL` and `WEATHER_API_KEY` are read but not used yet (data is simulated).
- Without email credentials, emails are only logged.
- Without Redis (`REDIS_*`), the app falls back to an in-memory cache. There is no Redis on the free tier, so leave these unset.

## Free-tier caveats

- The container sleeps after 15 minutes without traffic; the first request afterwards takes about 60 seconds to wake it.
- 100 container-hours per month, shared across all your containers.
- Resources: 0.25 vCPU and 512 MB RAM.
- No persistent disk: users and subscriptions live in process memory and reset on every restart or wake-up.
- WebSockets need the paid Always-On tier. The app's socket.io client falls back to HTTP long-polling, so the site still works on the free tier.
- Updating: push to `main` publishes a new `:latest`; redeploy or restart the container on SnapDeploy to pull it.

## Running locally instead

```bash
cp .env.example .env
docker compose up -d --build     # app + Redis on http://localhost:3003
```

Or without Docker: `npm ci && npm start` (Node.js 18+). `docker build -t nasaspace-app . && docker run --rm -p 3003:3003 --env-file .env nasaspace-app` runs the app alone.
