# NASA TEMPO Air Quality Monitor

Real-time air quality monitoring built on NASA TEMPO satellite data, ground-based
measurements and weather data. Node.js/Express backend, vanilla JS frontend,
Socket.IO for live updates, Redis-backed caching with an automatic in-memory
fallback.

## Features

- Real-time AQI lookup by coordinates, with pollutant breakdown (PM2.5, PM10,
  ozone, NO2, SO2, CO) and WHO-based health recommendations
- 5-day air quality forecast
- City ranking by country
- Historical data view with charts
- Email alert subscriptions (Gmail SMTP via Nodemailer)
- Live updates over WebSocket (Socket.IO)
- JWT-based user accounts (register/login/profile)

## Tech stack

- **Backend:** Node.js, Express, Socket.IO, Redis (optional, falls back to an
  in-memory cache), JWT, bcrypt, Nodemailer
- **Frontend:** Static HTML/CSS/JavaScript (no build step)
- **Deployment:** Docker, Docker Compose

## Project structure

```
.
├── server.js                # App entry point
├── routes/                  # Express routers (air quality, weather, tempo, notifications, users)
├── services/                # Business logic (cache, TEMPO/weather clients, notifications, users)
├── middleware/               # Auth + request validation
├── public/                  # Static frontend (HTML/CSS/JS)
├── Dockerfile
├── docker-compose.yml
└── env.example              # Environment variable template
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Docker (optional, for containerized deployment)

### Local development

```bash
git clone https://github.com/Alishnis/nasaspace-app.git
cd nasaspace-app
npm install
cp env.example .env
# edit .env with your own API keys
npm run dev
```

The app listens on `http://localhost:3003` by default. `/health` returns a
basic status check.

Redis is optional for local development — if it isn't reachable, the app
automatically falls back to an in-memory cache and logs a single notice
instead of retrying indefinitely.

### Environment variables

See [env.example](env.example) for the full list. The important ones:

| Variable | Description | Required |
|---|---|---|
| `PORT` | HTTP port (default `3003`) | no |
| `TEMPO_API_KEY` | NASA TEMPO / api.nasa.gov key | no (falls back to `DEMO_KEY` demo data) |
| `TEMPO_API_URL` | NASA TEMPO API base URL | no |
| `WEATHER_API_KEY` | OpenWeatherMap API key | no (falls back to simulated weather data) |
| `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` | SMTP credentials for alert emails | no (notifications are skipped if unset) |
| `JWT_SECRET` | Secret used to sign auth tokens | yes, for production |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | no |

**Never commit your real `.env` file.** It's git-ignored — use `env.example`
as the template and keep actual secrets out of version control.

## Docker deployment

### Docker Compose (recommended)

Runs the app together with Redis:

```bash
cp env.example .env
# edit .env with your production values
docker-compose up -d --build
```

The app will be available on `http://localhost:3003`, and the container
reports healthy once `GET /health` responds (see `HEALTHCHECK` in the
[Dockerfile](Dockerfile)).

Stop it with:

```bash
docker-compose down
```

### Plain Docker

```bash
docker build -t nasa-air-quality .
docker run -p 3003:3003 --env-file .env nasa-air-quality
```

## API endpoints

### Air quality — `/api/air-quality`
- `GET /current?lat=&lng=` — current AQI and pollutant breakdown
- `GET /forecast?lat=&lng=&days=` — multi-day forecast
- `GET /historical?lat=&lng=&startDate=&endDate=` — historical data
- `GET /alerts?lat=&lng=` — active alerts for a location
- `GET /ranking?country=` — city ranking for a country

### Weather — `/api/weather`
- `GET /current?lat=&lng=`
- `GET /forecast?lat=&lng=`
- `GET /historical?lat=&lng=`

### TEMPO satellite data — `/api/tempo`
- `GET /data?lat=&lng=`
- `GET /data/:date?lat=&lng=`
- `GET /coverage?lat=&lng=`

### Notifications — `/api/notifications`
- `POST /subscribe` — `{ lat, lng, email?, phone?, alertLevels }`
- `DELETE /unsubscribe/:subscriptionId`
- `GET /preferences/:userId`
- `PUT /preferences/:userId`
- `POST /test`

### Users — `/api/users`
- `POST /register` — `{ name, email, password }`
- `POST /login` — `{ email, password }`
- `GET /profile` — requires `Authorization: Bearer <token>`
- `PUT /profile` — requires auth
- `DELETE /account` — requires auth

### Health
- `GET /health` — `{ status, timestamp, uptime }`

## Testing the API

```bash
curl "http://localhost:3003/api/air-quality/current?lat=40.7128&lng=-74.0060"
```

## Security notes

- Requests are rate-limited (100 requests / 15 min per IP on `/api/*`) via
  `express-rate-limit`, and `helmet` sets standard security headers.
- Rotate `JWT_SECRET`, `TEMPO_API_KEY`, `WEATHER_API_KEY` and email
  credentials before deploying publicly — never reuse values that were ever
  committed to version control.

## License

MIT
