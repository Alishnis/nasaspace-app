# Running it

The live demo is offline (the Azure student credit that hosted it ran out), so the app is meant to be run locally. Requires Docker, or Node.js 18+.

## Docker Compose (app + Redis)

```bash
cp .env.example .env
docker compose up -d --build     # http://localhost:3003
```

(`docker-compose up -d --build` works the same with the older CLI.) Redis is optional; if it is unreachable the app uses an in-memory cache.

## Docker (app only)

```bash
docker build -t nasaspace-app .
docker run --rm -p 3003:3003 --env-file .env nasaspace-app
```

The `Dockerfile` defines a `HEALTHCHECK` that calls `/health`.

## Node.js

```bash
npm ci
cp .env.example .env
npm start                        # http://localhost:3003
```

`npm run dev` restarts on file changes (nodemon).

## Environment variables

All are optional for local use; defaults are in `.env.example`. Names only, never commit values.

- `PORT`
- `JWT_SECRET`
- `TEMPO_API_KEY`, `TEMPO_API_URL`
- `WEATHER_API_KEY`
- `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `REDIS_HOST`, `REDIS_PORT`

`TEMPO_API_KEY`, `TEMPO_API_URL` and `WEATHER_API_KEY` are read but not used yet (data is simulated). Without `JWT_SECRET`, a random secret is generated at each start and existing tokens stop working after a restart. Without email credentials, emails are only logged.

## State is in memory

Users and subscriptions are kept in process memory (no database), so they are lost whenever the app restarts.

## Legacy Azure files

`Dockerfile` and `docker-compose.yml` were originally used for the Azure App Service / Container Instances deployment. That deployment is gone; the files are kept as legacy reference and still work for local Docker.
